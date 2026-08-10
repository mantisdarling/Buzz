"""
Pytest unit tests for TruthLens ML ensemble and explainability functions.
"""
import os
import sys
import pytest

# Ensure ml directory is on sys.path
ML_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ml"))
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

from ensemble import TruthLensEnsemble


@pytest.fixture(name="ensemble")
def ensemble_fixture():
    return TruthLensEnsemble()


def test_ensemble_prediction_structure(ensemble: TruthLensEnsemble):
    text = (
        "Breaking News: Officials announce a new policy initiative regarding international trade agreements."
    )
    result = ensemble.predict(text)

    assert "verdict" in result
    assert result["verdict"] in ["Real", "Fake"]
    assert "confidence" in result
    assert 0.0 <= result["confidence"] <= 1.0

    assert "scores" in result
    assert "baseline" in result["scores"]
    assert "style" in result["scores"]
    assert "distilbert" in result["scores"]

    assert "explanation" in result
    assert isinstance(result["explanation"], list)
    if len(result["explanation"]) > 0:
        token = result["explanation"][0]
        assert "text" in token
        assert "score" in token


def test_ensemble_empty_text_fallback(ensemble: TruthLensEnsemble):
    result = ensemble.predict("   ")
    assert result["verdict"] == "Fake"
    assert result["confidence"] == 1.0
