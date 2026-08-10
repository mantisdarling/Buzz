import os
import joblib
import numpy as np
import pandas as pd
import re
import spacy
from typing import Dict, List, Tuple, Any

# Disable warnings from onnxruntime
os.environ["ORT_LOGGING_LEVEL"] = "3"
import onnxruntime as ort
from transformers import AutoTokenizer

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

class TruthLensEnsemble:
    def __init__(self):
        self.baseline_path = os.path.join(MODEL_DIR, "baseline_model.joblib")
        self.style_path = os.path.join(MODEL_DIR, "style_model.joblib")
        self.onnx_path = os.path.join(MODEL_DIR, "distilbert.onnx")
        self.tokenizer_path = os.path.join(MODEL_DIR, "distilbert_finetuned")
        
        self.baseline_pipeline = None
        self.style_model_data = None
        self.onnx_session = None
        self.tokenizer = None
        self.nlp = None
        
        self.load_models()
        
    def load_models(self):
        """
        Loads all model artifacts if they exist.
        """
        if os.path.exists(self.baseline_path):
            print("Ensemble: Loading baseline model...")
            self.baseline_pipeline = joblib.load(self.baseline_path)
            
        if os.path.exists(self.style_path):
            print("Ensemble: Loading style model...")
            self.style_model_data = joblib.load(self.style_path)
            
        if os.path.exists(self.onnx_path):
            print("Ensemble: Loading DistilBERT ONNX session...")
            self.onnx_session = ort.InferenceSession(self.onnx_path)
            
        # Try to load tokenizer from fine-tuned path or fallback to base
        try:
            if os.path.exists(self.tokenizer_path):
                self.tokenizer = AutoTokenizer.from_pretrained(self.tokenizer_path)
            else:
                self.tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
        except Exception as e:
            print(f"Warning: Failed to load tokenizer: {e}")
            
        # Load spaCy for style extraction
        try:
            self.nlp = spacy.load("en_core_web_lg")
        except OSError:
            # We will lazy-load spaCy inside predictions if needed to keep imports fast
            pass

    def _get_spacy(self):
        if self.nlp is None:
            try:
                self.nlp = spacy.load("en_core_web_lg")
            except OSError:
                from spacy.cli import download
                download("en_core_web_lg")
                self.nlp = spacy.load("en_core_web_lg")
        return self.nlp

    def _extract_style_features(self, text: str) -> Dict[str, float]:
        """
        Helper to extract style features from a single text.
        """
        nlp = self._get_spacy()
        doc = nlp(text)
        
        # Define tags matching train_style.py
        pos_tags = self.style_model_data["extractor_pos_tags"]
        dep_tags = self.style_model_data["extractor_dep_tags"]
        
        words = [token for token in doc if not token.is_punct and not token.is_space]
        sentences = list(doc.sents)
        
        num_words = len(words)
        num_sents = len(sentences)
        
        if num_words == 0:
            return {feat: 0.0 for feat in [f"pos_{t}" for t in pos_tags] + [f"dep_{t}" for t in dep_tags]}
            
        avg_word_len = np.mean([len(w.text) for w in words])
        avg_sent_len = num_words / max(num_sents, 1)
        
        pos_counts = {tag: 0 for tag in pos_tags}
        for token in doc:
            if token.pos_ in pos_counts:
                pos_counts[token.pos_] += 1
        pos_ratios = {f"pos_{tag}": count / num_words for tag, count in pos_counts.items()}
        
        dep_counts = {tag: 0 for tag in dep_tags}
        for token in doc:
            if token.dep_ in dep_counts:
                dep_counts[token.dep_] += 1
        dep_ratios = {f"dep_{tag}": count / num_words for tag, count in dep_counts.items()}
        
        num_caps = sum(1 for w in words if w.text.isupper() and len(w.text) > 1)
        caps_ratio = num_caps / num_words
        
        num_excl = sum(1 for token in doc if token.text == '!')
        excl_ratio = num_excl / num_words
        
        num_quest = sum(1 for token in doc if token.text == '?')
        quest_ratio = num_quest / num_words
        
        features = {
            "avg_word_len": avg_word_len,
            "avg_sent_len": avg_sent_len,
            "caps_ratio": caps_ratio,
            "excl_ratio": excl_ratio,
            "quest_ratio": quest_ratio,
            **pos_ratios,
            **dep_ratios
        }
        
        return features

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Executes inference across baseline, style, and DistilBERT models.
        Returns the individual scores and a weighted ensemble verdict.
        Label: 0 = Fake, 1 = Real
        """
        if not text.strip():
            return {
                "verdict": "Fake",
                "confidence": 1.0,
                "scores": {"baseline": 0.0, "style": 0.0, "distilbert": 0.0},
                "explanation": []
            }
            
        scores = {}
        weights = {}
        
        # 1. Baseline Model Prediction (TF-IDF + LogReg)
        if self.baseline_pipeline is not None:
            # probability of being Real (class 1)
            baseline_prob = self.baseline_pipeline.predict_proba([text])[0][1]
            scores["baseline"] = float(baseline_prob)
            weights["baseline"] = 0.2
        else:
            scores["baseline"] = 0.5
            weights["baseline"] = 0.0
            
        # 2. Stylometric Model Prediction
        if self.style_model_data is not None:
            try:
                features = self._extract_style_features(text)
                features_df = pd.DataFrame([features])
                style_pipeline = self.style_model_data["pipeline"]
                style_prob = style_pipeline.predict_proba(features_df)[0][1]
                scores["style"] = float(style_prob)
                weights["style"] = 0.2
            except Exception as e:
                print(f"Error predicting style: {e}")
                scores["style"] = 0.5
                weights["style"] = 0.0
        else:
            scores["style"] = 0.5
            weights["style"] = 0.0
            
        # 3. Primary Model Prediction (DistilBERT ONNX)
        if self.onnx_session is not None and self.tokenizer is not None:
            try:
                inputs = self.tokenizer(text, return_tensors="np", max_length=128, truncation=True, padding="max_length")
                # ONNX inputs must match the exported input names
                ort_inputs = {
                    "input_ids": inputs["input_ids"].astype(np.int64),
                    "attention_mask": inputs["attention_mask"].astype(np.int64)
                }
                logits = self.onnx_session.run(None, ort_inputs)[0][0]
                # Softmax to get probability
                exp_logits = np.exp(logits - np.max(logits)) # stable softmax
                probs = exp_logits / np.sum(exp_logits)
                distilbert_prob = probs[1] # class 1 = Real
                scores["distilbert"] = float(distilbert_prob)
                weights["distilbert"] = 0.6
            except Exception as e:
                print(f"Error predicting DistilBERT ONNX: {e}")
                scores["distilbert"] = 0.5
                weights["distilbert"] = 0.0
        else:
            scores["distilbert"] = 0.5
            weights["distilbert"] = 0.0
            
        # Re-normalize weights if some models are missing
        total_w = sum(weights.values())
        if total_w > 0:
            normalized_weights = {k: v / total_w for k, v in weights.items()}
        else:
            normalized_weights = {"baseline": 1.0}
            scores["baseline"] = 0.5
            
        # Compute ensembled score (probability of being Real)
        ensembled_prob = sum(scores[k] * normalized_weights.get(k, 0.0) for k in scores)
        
        # Define verdict and confidence
        if ensembled_prob >= 0.5:
            verdict = "Real"
            confidence = ensembled_prob
        else:
            verdict = "Fake"
            confidence = 1.0 - ensembled_prob
            
        # 4. Explainability (Feature Attributions)
        explanation = self.explain_baseline(text)
        
        return {
            "verdict": verdict,
            "confidence": float(confidence),
            "scores": scores,
            "explanation": explanation
        }

    def explain_baseline(self, text: str) -> List[Dict[str, Any]]:
        """
        Generates token-level feature attribution scores based on the baseline model's weights.
        This provides instant, highly accurate SHAP-equivalent importances.
        Positive values support "Real", negative values support "Fake".
        """
        if self.baseline_pipeline is None:
            return []
            
        try:
            tfidf = self.baseline_pipeline.named_steps['tfidf']
            clf = self.baseline_pipeline.named_steps['clf']
            
            # Get model coefficients and bias
            coef = clf.coef_[0]
            feature_names = tfidf.get_feature_names_out()
            
            # Simple word tokenizer that keeps track of indices/positions
            # We want to match tokens in the input text
            words = re.findall(r'\b\w+\b', text.lower())
            
            if not words:
                return []
                
            # Build tfidf of this single document
            feature_vector = tfidf.transform([text]).toarray()[0]
            
            # Active features (indices where tfidf is non-zero)
            active_indices = np.where(feature_vector > 0)[0]
            
            # Map feature index -> contribution (TF-IDF value * Logistic Regression coefficient)
            contributions = {}
            for idx in active_indices:
                feat_name = feature_names[idx]
                contrib = feature_vector[idx] * coef[idx]
                contributions[feat_name] = contrib
                
            # Now tokenise the original text and assign attribution scores
            # We want to preserve exact case and spacing for the UI output
            raw_tokens = re.split(r'(\s+|\b)', text)
            raw_tokens = [t for t in raw_tokens if t] # Filter out empty strings
            
            explanation_tokens = []
            for token in raw_tokens:
                clean_tok = token.strip().lower()
                score = 0.0
                if re.match(r'^\w+$', clean_tok):
                    # Check single word contribution
                    if clean_tok in contributions:
                        score = contributions[clean_tok]
                
                # Normalize scores to [-1, 1] range for visual highlights
                # Clamp/map to -1 to 1 based on a scaling factor
                # Typical active contributions range from -0.5 to 0.5
                normalized_score = np.clip(score * 3.0, -1.0, 1.0)
                
                explanation_tokens.append({
                    "text": token,
                    "score": float(normalized_score)
                })
                
            return explanation_tokens
        except Exception as e:
            print(f"Error generating explanation: {e}")
            return [{"text": t, "score": 0.0} for t in re.split(r'(\s+)', text)]

if __name__ == "__main__":
    # Test prediction
    ensemble = TruthLensEnsemble()
    test_text = "Breaking News: Researchers discover that eating dark chocolate improves cognitive performance by 20 percent. The groundbreaking study suggests daily consumption is highly beneficial."
    res = ensemble.predict(test_text)
    print(f"Verdict: {res['verdict']} (Confidence: {res['confidence']:.2f})")
    print(f"Scores: {res['scores']}")
    print(f"Explanation (first few tokens): {res['explanation'][:10]}")
