import os
import joblib
import numpy as np
import pandas as pd
import spacy
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from data_loader import get_combined_data
from tqdm import tqdm

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

class StyleFeatureExtractor:
    def __init__(self):
        # Load spaCy large model
        print("Loading spaCy model (en_core_web_lg)...")
        try:
            self.nlp = spacy.load("en_core_web_lg")
        except OSError:
            print("spaCy model en_core_web_lg not found. Downloading...")
            from spacy.cli import download
            download("en_core_web_lg")
            self.nlp = spacy.load("en_core_web_lg")
            
        # Define features we want to track
        self.pos_tags = ["ADJ", "ADP", "ADV", "AUX", "CONJ", "CCONJ", "DET", "INTJ", 
                         "NOUN", "NUM", "PART", "PRON", "PROPN", "SCONJ", "SYM", "VERB", "X"]
        self.dep_tags = ["nsubj", "nsubjpass", "dobj", "iobj", "pobj", "attr", "ccomp", 
                         "xcomp", "complm", "obj", "nummod", "appos", "acl", "relcl", 
                         "amod", "appos", "advcl", "advmod", "neg", "poss", "possessive", 
                         "mark", "prep", "aux", "auxpass", "cop", "det", "conj", "cc"]
        
    def anonymize_and_extract(self, doc):
        """
        Anonymizes named entities and returns:
        1. Anonymized text
        2. Extracted stylometric feature dictionary
        """
        # Anonymize entities
        text = doc.text
        # Sort entities in reverse order of start char to prevent index shifts during replacement
        entities = sorted(doc.ents, key=lambda e: e.start_char, reverse=True)
        for ent in entities:
            placeholder = f"[{ent.label_}]"
            text = text[:ent.start_char] + placeholder + text[ent.end_char:]
            
        # Stylometric metrics
        words = [token for token in doc if not token.is_punct and not token.is_space]
        sentences = list(doc.sents)
        
        num_words = len(words)
        num_sents = len(sentences)
        
        if num_words == 0:
            return text, {feat: 0.0 for feat in self.pos_tags + self.dep_tags}
            
        # Basic counts
        avg_word_len = np.mean([len(w.text) for w in words])
        avg_sent_len = num_words / max(num_sents, 1)
        
        # POS Tag ratios
        pos_counts = {tag: 0 for tag in self.pos_tags}
        for token in doc:
            if token.pos_ in pos_counts:
                pos_counts[token.pos_] += 1
                
        pos_ratios = {f"pos_{tag}": count / num_words for tag, count in pos_counts.items()}
        
        # Dependency tag ratios
        dep_counts = {tag: 0 for tag in self.dep_tags}
        for token in doc:
            if token.dep_ in dep_counts:
                dep_counts[token.dep_] += 1
                
        dep_ratios = {f"dep_{tag}": count / num_words for tag, count in dep_counts.items()}
        
        # Capitalization and Punctuation Ratios
        num_caps = sum(1 for w in words if w.text.isupper() and len(w.text) > 1)
        caps_ratio = num_caps / num_words
        
        num_excl = sum(1 for token in doc if token.text == '!')
        excl_ratio = num_excl / num_words
        
        num_quest = sum(1 for token in doc if token.text == '?')
        quest_ratio = num_quest / num_words
        
        # Collect all features
        features = {
            "avg_word_len": avg_word_len,
            "avg_sent_len": avg_sent_len,
            "caps_ratio": caps_ratio,
            "excl_ratio": excl_ratio,
            "quest_ratio": quest_ratio,
            **pos_ratios,
            **dep_ratios
        }
        
        return text, features

    def fit_transform_corpus(self, texts):
        """
        Processes a corpus of texts, returning anonymized texts and a feature matrix.
        """
        features_list = []
        anon_texts = []
        
        print("Processing texts with spaCy pipeline...")
        # Use nlp.pipe for fast batch processing
        docs = self.nlp.pipe(texts, batch_size=256, n_process=1)
        for doc in tqdm(docs, total=len(texts)):
            anon_txt, feats = self.anonymize_and_extract(doc)
            anon_texts.append(anon_txt)
            features_list.append(feats)
            
        return anon_texts, pd.DataFrame(features_list)

def train_style_model(sample_size=None):
    """
    Trains a Logistic Regression model on the extracted stylometric features.
    Saves extractor + trained classifier pipeline.
    """
    print("Fetching dataset for stylometric model...")
    # Load dataset. Stylometry is slower so we limit it for faster training if requested
    df = get_combined_data(max_samples_per_dataset=sample_size)
    
    if len(df) == 0:
        print("No data available. Exiting.")
        return
        
    extractor = StyleFeatureExtractor()
    
    # Process texts to extract features
    # Since spaCy is slow on CPU, we limit to max 3000 samples for training style models in testing if sample_size is not set
    limit_samples = sample_size or 3000
    df_sample = df.sample(min(len(df), limit_samples), random_state=42).reset_index(drop=True)
    
    texts = df_sample["text"].tolist()
    labels = df_sample["label"].tolist()
    
    anon_texts, X_features = extractor.fit_transform_corpus(texts)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X_features, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    # Stylometric classifier pipeline (Standardize + Train)
    style_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('clf', LogisticRegression(max_iter=1000, C=0.5, random_state=42))
    ])
    
    print("Training stylometric classifier...")
    style_pipeline.fit(X_train, y_train)
    
    y_pred = style_pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n--- Stylometric Model Evaluation ---")
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Fake", "Real"]))
    
    # Save the feature extractor metadata and the pipeline
    model_data = {
        "extractor_pos_tags": extractor.pos_tags,
        "extractor_dep_tags": extractor.dep_tags,
        "pipeline": style_pipeline
    }
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, "style_model.joblib")
    joblib.dump(model_data, model_path)
    print(f"Style model saved successfully to {model_path}")
    
    return model_data

if __name__ == "__main__":
    # Train on 3000 samples per dataset for a balance of speed and style signal learning
    train_style_model(sample_size=3000)
