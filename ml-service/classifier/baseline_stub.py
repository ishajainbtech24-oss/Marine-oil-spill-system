"""
baseline_stub.py

Purpose:
--------
A NAIVE, RULE-BASED vessel classifier used for two things:
1. A quick sanity check that our Python environment works before we touch
   any real dataset.
2. A baseline that our real ML classifier (built in a later phase) must
   outperform. If our trained model can't beat this simple rule, the model
   isn't adding value.

This is NOT the final classifier. It uses hand-picked length thresholds,
not learned patterns. Every number in here is a rough rule of thumb, not a
measured/validated fact - it's a placeholder to get end-to-end plumbing
working.

Input:
------
A list of vessel "features" dictionaries, each with:
    - length_m (float): estimated vessel length in meters
    - width_m (float): estimated vessel width in meters

Output:
-------
For each vessel, a dictionary matching the shape used throughout the
project:
    {
        "vessel_type": "tanker" | "cargo" | "fishing",
        "size": "small" | "medium" | "large",
        "confidence": float   # NOTE: for this naive baseline, confidence
                               # is just a fixed placeholder, not a real
                               # probability. Real confidence scores come
                               # later from the trained ML model.
    }
"""

from typing import TypedDict, Literal


class VesselFeatures(TypedDict):
    length_m: float
    width_m: float


class ClassificationResult(TypedDict):
    vessel_type: Literal["tanker", "cargo", "fishing"]
    size: Literal["small", "medium", "large"]
    confidence: float


# ---------------------------------------------------------------------------
# Thresholds used by the naive rules below.
# These are rough, illustrative starting points ONLY - not derived from any
# dataset yet. Once we have real labeled data, these will either be tuned
# properly or replaced entirely by the trained classifier in Phase 4.
# ---------------------------------------------------------------------------
LENGTH_SMALL_MAX_M = 50      # below this -> "small" (rough proxy: fishing boats)
LENGTH_MEDIUM_MAX_M = 150    # below this -> "medium" (rough proxy: cargo)
                              # above this -> "large" (rough proxy: tankers)

NAIVE_CONFIDENCE = 0.5       # placeholder only - this rule has no real
                              # notion of confidence, so we use a fixed
                              # mid-value to keep the output shape consistent


def classify_vessel_naive(features: VesselFeatures) -> ClassificationResult:
    """
    Classify a single vessel using a simple length-based rule.

    This mirrors the "length threshold rule" baseline requested for
    comparison against the real classifier later on.
    """
    length_m = features["length_m"]

    if length_m < LENGTH_SMALL_MAX_M:
        vessel_type = "fishing"
        size = "small"
    elif length_m < LENGTH_MEDIUM_MAX_M:
        vessel_type = "cargo"
        size = "medium"
    else:
        vessel_type = "tanker"
        size = "large"

    return {
        "vessel_type": vessel_type,
        "size": size,
        "confidence": NAIVE_CONFIDENCE,
    }


def classify_vessels_naive(
    vessels: list[VesselFeatures],
) -> list[ClassificationResult]:
    """Classify a list of vessels, one result per input vessel."""
    return [classify_vessel_naive(v) for v in vessels]


if __name__ == "__main__":
    # Small hand-made test set - NOT real ship measurements, just numbers
    # chosen to exercise all three branches of the rule above.
    sample_vessels: list[VesselFeatures] = [
        {"length_m": 18.0, "width_m": 5.0},    # expect: fishing / small
        {"length_m": 95.0, "width_m": 16.0},   # expect: cargo / medium
        {"length_m": 240.0, "width_m": 34.0},  # expect: tanker / large
    ]

    results = classify_vessels_naive(sample_vessels)

    for vessel, result in zip(sample_vessels, results):
        print(f"Input: {vessel}")
        print(f"Output: {result}")
        print("-" * 40)
