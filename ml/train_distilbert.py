import os
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset
from data_loader import get_combined_data
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_OUT_DIR = os.path.join(MODEL_DIR, "distilbert_finetuned")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average='binary')
    acc = accuracy_score(labels, predictions)
    return {
        'accuracy': acc,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }

def train_distilbert(sample_size=None, epochs=1):
    """
    Fine-tunes a DistilBERT model on article content.
    For local CPU efficiency, default sample_size is small, but can be scaled for GPU.
    """
    print("Fetching dataset for DistilBERT fine-tuning...")
    # Load dataset
    df = get_combined_data(max_samples_per_dataset=sample_size)
    
    if len(df) == 0:
        print("No data available. Exiting.")
        return
        
    # Standardize sample size for demo (500 samples if not specified to prevent minutes-long locks on CPU)
    limit_samples = sample_size or 500
    df_sample = df.sample(min(len(df), limit_samples), random_state=42).reset_index(drop=True)
    
    print(f"Tokenizing dataset with {len(df_sample)} samples...")
    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
    
    # Train/Val Split
    train_df, val_df = train_test_split(df_sample, test_size=0.2, random_state=42, stratify=df_sample["label"])
    
    # Convert to HF Dataset
    train_dataset = Dataset.from_pandas(train_df[["text", "label"]])
    val_dataset = Dataset.from_pandas(val_df[["text", "label"]])
    
    # Tokenize function
    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)
        
    train_tokenized = train_dataset.map(tokenize_function, batched=True)
    val_tokenized = val_dataset.map(tokenize_function, batched=True)
    
    # Initialize DistilBERT classification model
    print("Loading base distilbert-base-uncased model...")
    model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=2)
    
    # Define training arguments (Updated for Transformers v5.x compatibility)
    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=epochs,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        warmup_steps=50,
        weight_decay=0.01,
        logging_steps=10,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        use_cpu=not torch.cuda.is_available()
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_tokenized,
        eval_dataset=val_tokenized,
        compute_metrics=compute_metrics,
    )
    
    print("Starting DistilBERT fine-tuning...")
    trainer.train()
    
    # Evaluate
    print("Evaluating fine-tuned model...")
    eval_results = trainer.evaluate()
    print(f"Eval results: {eval_results}")
    
    # Save the model and tokenizer
    print(f"Saving model to {MODEL_OUT_DIR}...")
    model.save_pretrained(MODEL_OUT_DIR)
    tokenizer.save_pretrained(MODEL_OUT_DIR)
    print("Model saved successfully.")
    
    return model

if __name__ == "__main__":
    # Run a quick 1-epoch training on 500 samples for CPU sanity check
    train_distilbert(sample_size=500, epochs=1)
