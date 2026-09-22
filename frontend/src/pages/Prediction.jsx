import { useState } from "react";
import Navbar from "../components/Navbar";

function Prediction() {
  const [trafficDensity, setTrafficDensity] = useState(50);
  const [hornEvents, setHornEvents] = useState(2);
  const [avgSpeed, setAvgSpeed] = useState(60);
  const [signalWaitTime, setSignalWaitTime] = useState(30);
  const [weather, setWeather] = useState("Clear");
  const [roadQuality, setRoadQuality] = useState(7);
  const [experience, setExperience] = useState("Intermediate");
  const [stressIndex, setStressIndex] = useState(40);
  const [riskPopup, setRiskPopup] = useState(null);
  const [location, setLocation] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        setError(error.message);
      }
    );
  };

  const getPrediction = async () => {
    setError("");
    setPrediction(null);

    if (!location) {
      setError(
        "Please get your current location before predicting risk."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            traffic_density: trafficDensity,
            horn_events_per_min: hornEvents,
            avg_speed: avgSpeed,
            signal_wait_time: signalWaitTime,
            weather_condition: weather,
            road_quality_score: roadQuality,
            driver_experience_level: experience,
            stress_index: stressIndex,
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Prediction failed (${response.status}): ${errorText}`
        );
      }

      const result = await response.json();

      setPrediction(result);
      setRiskPopup({
  risk: result.predicted_risk,
  confidence: result.confidence,
});

setTimeout(() => {
  setRiskPopup(null);
}, 6000);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskClass = () => {
    if (!prediction) {
      return "";
    }

    return `prediction-risk prediction-${prediction.predicted_risk.toLowerCase()}`;
  };

  return (
    <div>

      <Navbar />
      {riskPopup && (
  <div className={`risk-popup ${riskPopup.risk.toLowerCase()}`}>
    <div className="risk-popup-icon">
      {riskPopup.risk === "Low"
        ? "✓"
        : "⚠"}
    </div>

    <div className="risk-popup-content">
      <h3>
        {riskPopup.risk === "Low"
          ? "LOW RISK"
          : riskPopup.risk === "Medium"
          ? "MEDIUM RISK DETECTED"
          : "HIGH RISK DETECTED"}
      </h3>

      <p>
        Model confidence: {riskPopup.confidence}%
      </p>

      <span>
        {riskPopup.risk === "Low"
          ? "Good job! Continue driving safely and follow traffic rules."
          : riskPopup.risk === "Medium"
          ? "Stay alert, reduce speed and avoid sudden manoeuvres."
          : "Drive with extra caution. Slow down and maintain extra following distance."}
      </span>
    </div>

    <button
      onClick={() => setRiskPopup(null)}
      className="risk-popup-close"
    >
      ×
    </button>
  </div>
)}
      <main className="prediction-page">
        {/* Header */}
        <div className="prediction-header">
          <div>
            <span className="section-label">
              ROAD RISK ANALYSIS
            </span>

            <h1>Predict Road Risk</h1>

            <p>
              Enter the current traffic, road, environmental,
              and driver conditions to generate an AI-based
              risk assessment.
            </p>
          </div>
        </div>

        {/* Location */}
        <section className="prediction-location card">
          <div className="prediction-section-heading">
            <div>
              <span className="form-step">01</span>

              <div>
                <h2>Current Location</h2>

                <p>
                  Capture your current position for
                  location-based risk analysis.
                </p>
              </div>
            </div>

            <button onClick={getLocation}>
              {location
                ? "Update Location"
                : "Get Current Location"}
            </button>
          </div>

          {location ? (
            <div className="location-status">
              <span className="location-dot">●</span>

              <div>
                <strong>Location captured successfully</strong>

                <p>
                  {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          ) : (
            <div className="location-empty">
              <span>⌖</span>

              <p>
                Your location is required before generating
                a prediction.
              </p>
            </div>
          )}
        </section>

        {/* Form */}
        <div className="prediction-grid">
          {/* Traffic */}
          <section className="prediction-card card">
            <div className="prediction-card-header">
              <span className="form-step">02</span>

              <div>
                <h2>Traffic Conditions</h2>

                <p>
                  Current traffic activity and road movement.
                </p>
              </div>
            </div>

            <div className="prediction-fields">
              <label>
                Traffic Density
                <span>0–100</span>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={trafficDensity}
                  onChange={(e) =>
                    setTrafficDensity(Number(e.target.value))
                  }
                />
              </label>

              <label>
                Horn Events per Minute

                <input
                  type="number"
                  min="0"
                  value={hornEvents}
                  onChange={(e) =>
                    setHornEvents(Number(e.target.value))
                  }
                />
              </label>

              <label>
                Average Speed
                <span>km/h</span>

                <input
                  type="number"
                  min="0"
                  max="200"
                  value={avgSpeed}
                  onChange={(e) =>
                    setAvgSpeed(Number(e.target.value))
                  }
                />
              </label>

              <label>
                Signal Wait Time
                <span>seconds</span>

                <input
                  type="number"
                  min="0"
                  value={signalWaitTime}
                  onChange={(e) =>
                    setSignalWaitTime(Number(e.target.value))
                  }
                />
              </label>
            </div>
          </section>

          {/* Environment */}
          <section className="prediction-card card">
            <div className="prediction-card-header">
              <span className="form-step">03</span>

              <div>
                <h2>Road & Environment</h2>

                <p>
                  Environmental and road condition factors.
                </p>
              </div>
            </div>

            <div className="prediction-fields">
              <label>
                Weather Condition

                <select
                  value={weather}
                  onChange={(e) =>
                    setWeather(e.target.value)
                  }
                >
                  <option value="Clear">Clear</option>
                  <option value="Foggy">Foggy</option>
                  <option value="Hot">Hot</option>
                  <option value="Rainy">Rainy</option>
                </select>
              </label>

              <label>
                Road Quality Score
                <span>0–10</span>

                <input
                  type="number"
                  min="0"
                  max="10"
                  value={roadQuality}
                  onChange={(e) =>
                    setRoadQuality(Number(e.target.value))
                  }
                />
              </label>
            </div>
          </section>

          {/* Driver */}
          <section className="prediction-card card">
            <div className="prediction-card-header">
              <span className="form-step">04</span>

              <div>
                <h2>Driver Conditions</h2>

                <p>
                  Driver experience and stress indicators.
                </p>
              </div>
            </div>

            <div className="prediction-fields">
              <label>
                Driver Experience

                <select
                  value={experience}
                  onChange={(e) =>
                    setExperience(e.target.value)
                  }
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">
                    Intermediate
                  </option>
                  <option value="Expert">Expert</option>
                </select>
              </label>

              <label>
                Stress Index
                <span>0–100</span>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={stressIndex}
                  onChange={(e) =>
                    setStressIndex(Number(e.target.value))
                  }
                />
              </label>
            </div>
          </section>

          {/* Analysis */}
          <section className="prediction-action card">
            <span className="section-label">
              FINAL ANALYSIS
            </span>

            <h2>Ready to analyze?</h2>

            <p>
              RoadSense will evaluate the entered conditions
              and generate a traffic risk classification.
            </p>

            <button
              className="predict-button"
              onClick={getPrediction}
              disabled={loading}
            >
              {loading
                ? "Analyzing Road Risk..."
                : "Predict Road Risk →"}
            </button>
          </section>
        </div>

        {/* Error */}
        {error && (
          <section className="prediction-error">
            <strong>Prediction Error</strong>

            <p>{error}</p>
          </section>
        )}

        {/* Result */}
        {prediction && (
          <section className="prediction-result">
            <div>
              <span className="section-label">
                ANALYSIS COMPLETE
              </span>

              <h2>Road Risk Assessment</h2>

              <p>
                Prediction generated successfully using the
                current road and driver conditions.
              </p>
            </div>

            <div className={getRiskClass()}>
              <span className="risk-result-label">
                PREDICTED RISK
              </span>

              <strong>
                {prediction.predicted_risk}
              </strong>

              <span>
                {prediction.confidence}% confidence
              </span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Prediction;