import os
import pandas as pd
from datasets import load_dataset
import re

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def clean_text(text):
    """
    Apply basic sanitization and normalization to input text.
    """
    if not isinstance(text, str):
        return ""
    # Remove excessive whitespaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def load_liar_dataset():
    """
    Loads the LIAR dataset from the community Parquet repository on Hugging Face.
    LIAR labels in rickpereira/liar are strings:
    'false', 'half-true', 'mostly-true', 'true', 'barely-true', 'pants-on-fire'
    Binary conversion:
    Fake (0): 'false', 'barely-true', 'pants-on-fire'
    Real (1): 'true', 'mostly-true', 'half-true'
    """
    print("Loading LIAR dataset from Hugging Face (rickpereira/liar)...")
    try:
        # Load train, validation, and test splits (rickpereira/liar uses standard parquet, no script blocking)
        dataset = load_dataset("rickpereira/liar")
        
        splits = ["train", "validation", "test"]
        dfs = []
        for split in splits:
            df_split = pd.DataFrame(dataset[split])
            df_split = df_split[["statement", "label"]].rename(columns={"statement": "text"})
            
            # Map string labels to binary (0 = Fake, 1 = Real)
            def map_label(val):
                val_str = str(val).strip().lower()
                if val_str in ['false', 'barely-true', 'pants-on-fire']:
                    return 0
                elif val_str in ['true', 'mostly-true', 'half-true']:
                    return 1
                return 0 # Default fallback
                
            df_split["label"] = df_split["label"].apply(map_label)
            df_split["source_dataset"] = "liar"
            dfs.append(df_split)
            
        df = pd.concat(dfs, ignore_index=True)
        df["text"] = df["text"].apply(clean_text)
        df = df[df["text"].str.len() > 10]
        print(f"LIAR dataset loaded with {len(df)} samples.")
        return df
    except Exception as e:
        print(f"Error loading LIAR dataset: {e}")
        return pd.DataFrame(columns=["text", "label", "source_dataset"])

def load_isot_dataset():
    """
    Loads a cleaned version of the ISOT dataset from Hugging Face.
    Labels in dataset target: 0 = Real, 1 = Fake
    """
    print("Loading ISOT dataset from Hugging Face (Phoenyx83/ISOT-Fake-News-Dataset-FineTuned-2022)...")
    try:
        dataset = load_dataset("Phoenyx83/ISOT-Fake-News-Dataset-FineTuned-2022")
        
        dfs = []
        for split in ["train", "validation"]:
            df_split = pd.DataFrame(dataset[split])
            df_split = df_split[["text", "target"]].rename(columns={"target": "label"})
            # Map labels: 0 (Real) -> 1 (Real), 1 (Fake) -> 0 (Fake)
            df_split["label"] = df_split["label"].apply(lambda x: 1 if x == 0 else 0)
            df_split["source_dataset"] = "isot"
            dfs.append(df_split)
            
        df = pd.concat(dfs, ignore_index=True)
        df["text"] = df["text"].apply(clean_text)
        df = df[df["text"].str.len() > 10]
        print(f"ISOT dataset loaded with {len(df)} samples.")
        return df
    except Exception as e:
        print(f"Error loading ISOT dataset from HF: {e}")
        return pd.DataFrame(columns=["text", "label", "source_dataset"])

def get_combined_data(max_samples_per_dataset=None):
    """
    Loads both LIAR and ISOT datasets, combines them, and returns them as a DataFrame.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    cache_path = os.path.join(DATA_DIR, "combined_dataset.csv")
    
    # Check cache first
    if os.path.exists(cache_path):
        try:
            print(f"Loading cached dataset from {cache_path}...")
            df = pd.read_csv(cache_path)
            if len(df) > 0:
                df["label"] = df["label"].astype(int)
                return df
        except Exception as e:
            print(f"Cache corrupt, reloading: {e}")
    
    df_liar = load_liar_dataset()
    df_isot = load_isot_dataset()
    
    if max_samples_per_dataset:
        if len(df_liar) > 0:
            df_liar = df_liar.sample(min(len(df_liar), max_samples_per_dataset), random_state=42)
        if len(df_isot) > 0:
            df_isot = df_isot.sample(min(len(df_isot), max_samples_per_dataset), random_state=42)
            
    df = pd.concat([df_liar, df_isot], ignore_index=True)
    # Shuffle
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    # Ensure discrete integer types for classification targets
    df["label"] = df["label"].astype(int)
    
    # Save cache
    try:
        df.to_csv(cache_path, index=False)
        print(f"Dataset cached successfully to {cache_path} with {len(df)} samples.")
    except Exception as e:
        print(f"Failed to cache dataset: {e}")
        
    return df

if __name__ == "__main__":
    df = get_combined_data(max_samples_per_dataset=1000)
    print(df.head())
    print(df["label"].value_counts())
