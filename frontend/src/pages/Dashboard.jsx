import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { enableNotifications } from "../services/notificationService";

function Dashboard() {

  const [history, setHistory] = useState([]);
  const [location, setLocation] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] =
  useState(false);

  const [notificationMessage, setNotificationMessage] =
  useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [simulationLoading, setSimulationLoading] =
    useState(false);

  const [selectedScenario, setSelectedScenario] =
    useState("normal");

  const [simulationResult, setSimulationResult] =
    useState(null);
  const [multiSimulationRunning, setMultiSimulationRunning] = useState(false);

const [multiSimulationResults, setMultiSimulationResults] = useState([]);

const [currentSimulationLocation, setCurrentSimulationLocation] = useState(null);

  const loadHistory = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/history",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const result = await response.json();

      setHistory(result);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      setError("");

      await loadHistory();

      setLoading(false);
    };

    initializeDashboard();
  }, []);

  const getLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setError("");
      },
      (error) => {
        setError(error.message);
      }
    );
  };

  const scenarios = {
  normal: {
    name: "Normal Traffic",
    description:
      "Typical traffic conditions with good road and driver conditions.",
    traffic_density: 25,
    horn_events_per_min: 1,
    avg_speed: 60,
    signal_wait_time: 15,
    weather_condition: "Clear",
    road_quality_score: 8.5,
    driver_experience_level: "Expert",
    stress_index: 25,
  },

  heavy: {
    name: "Heavy Traffic",
    description:
      "Heavy traffic with moderate delays, rainy weather and increased driver stress.",
    traffic_density: 68,
    horn_events_per_min: 5,
    avg_speed: 38,
    signal_wait_time: 55,
    weather_condition: "Rainy",
    road_quality_score: 6.0,
    driver_experience_level: "Intermediate",
    stress_index: 52,
  },

  critical: {
    name: "Critical Conditions",
    description:
      "Severe traffic and road conditions with reduced speed and high stress.",
    traffic_density: 90,
    horn_events_per_min: 10,
    avg_speed: 25,
    signal_wait_time: 90,
    weather_condition: "Rainy",
    road_quality_score: 3.5,
    driver_experience_level: "Beginner",
    stress_index: 82,
  },
};

const simulationLocations = [
  {
    id: "electronic-city",
    name: "Electronic City",
    description: "Simulated low-risk traffic environment.",
    latitude: 12.8456,
    longitude: 77.6603,
    scenario: "normal",
  },

  {
    id: "silk-board",
    name: "Silk Board",
    description: "Simulated congested traffic environment.",
    latitude: 12.9177,
    longitude: 77.6228,
    scenario: "heavy",
  },

  {
    id: "kr-puram",
    name: "KR Puram",
    description: "Simulated critical traffic environment.",
    latitude: 13.0098,
    longitude: 77.7041,
    scenario: "critical",
  },
];
  const runSimulation = async () => {
    setError("");
    setSimulationResult(null);

    if (!location) {
      setError(
        "Please get your current location before starting the simulation."
      );
      return;
    }

    setSimulationLoading(true);

    const scenario = scenarios[selectedScenario];

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/predict",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },

          body: JSON.stringify({
            traffic_density:
              scenario.traffic_density,

            horn_events_per_min:
              scenario.horn_events_per_min,

            avg_speed:
              scenario.avg_speed,

            signal_wait_time:
              scenario.signal_wait_time,

            weather_condition:
              scenario.weather_condition,

            road_quality_score:
              scenario.road_quality_score,

            driver_experience_level:
              scenario.driver_experience_level,

            stress_index:
              scenario.stress_index,

            latitude: location.latitude,
            longitude: location.longitude,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Simulation failed (${response.status}): ${errorText}`
        );
      }

      const result = await response.json();

      setSimulationResult({
        ...result,
        scenarioName: scenario.name,
        scenarioDescription: scenario.description,
        inputs: scenario,
      });

      await loadHistory();
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setSimulationLoading(false);
    }
  };

  const runMultiLocationSimulation = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Please login again to run the simulation.");
    return;
  }

  setMultiSimulationRunning(true);
  setMultiSimulationResults([]);
  setCurrentSimulationLocation(null);
  setError("");

  const results = [];

  try {
    for (const location of simulationLocations) {
      setCurrentSimulationLocation(location.id);

      const scenario = scenarios[location.scenario];

      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            traffic_density: scenario.traffic_density,
            horn_events_per_min: scenario.horn_events_per_min,
            avg_speed: scenario.avg_speed,
            signal_wait_time: scenario.signal_wait_time,
            weather_condition: scenario.weather_condition,
            road_quality_score: scenario.road_quality_score,
            driver_experience_level:
              scenario.driver_experience_level,
            stress_index: scenario.stress_index,
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Prediction failed for ${location.name}`
        );
      }

      const prediction = await response.json();

      const result = {
        location,
        scenario,
        prediction,
      };

      results.push(result);

      setMultiSimulationResults([...results]);

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );
    }

    await loadHistory();
  } catch (error) {
    console.error(error);
    setError(error.message);
  } finally {
    setCurrentSimulationLocation(null);
    setMultiSimulationRunning(false);
  }
};
  const totalPredictions = history.length;

  const highRiskCount = history.filter(
    (item) => item.predicted_risk === "High"
  ).length;

  const mediumRiskCount = history.filter(
    (item) => item.predicted_risk === "Medium"
  ).length;

  const lowRiskCount = history.filter(
    (item) => item.predicted_risk === "Low"
  ).length;


  const latestPrediction =
    history.length > 0 ? history[0] : null;

  const recentPredictions = history.slice(0, 5);

  const highPercentage =
    totalPredictions > 0
      ? Math.round(
          (highRiskCount / totalPredictions) * 100
        )
      : 0;

  const mediumPercentage =
    totalPredictions > 0
      ? Math.round(
          (mediumRiskCount / totalPredictions) * 100
        )
      : 0;

  const lowPercentage =
    totalPredictions > 0
      ? Math.round(
          (lowRiskCount / totalPredictions) * 100
        )
      : 0;


  const getRiskClass = (risk) => {
    if (risk === "High") return "risk-high";

    if (risk === "Medium") return "risk-medium";

    return "risk-low";
  };


  const getRiskMessage = (risk) => {
    if (risk === "High") {
      return "High traffic risk detected. Please reduce speed and drive cautiously.";
    }

    if (risk === "Medium") {
      return "Moderate traffic risk detected. Drive with increased caution.";
    }

    return "Current conditions indicate relatively low traffic risk.";
  };

  const getGaugeWidth = (risk) => {
    if (risk === "High") return "90%";

    if (risk === "Medium") return "60%";

    return "30%";
  };
  const handleEnableNotifications = async () => {
  setNotificationMessage("");

  const result = await enableNotifications();

  if (result.success) {
    setNotificationsEnabled(true);
    setNotificationMessage(
      "Safety notifications enabled on this device."
    );
  } else {
    setNotificationMessage(result.error);
  }
};
  return (
    <div className="page">
      <Navbar />

      <main className="dashboard">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="dashboard-hero">
          <div>
            <span className="section-label">
              TRAFFIC RISK MONITORING
            </span>

            <h1>RoadSense Dashboard</h1>

            <p>
              Monitor traffic risk predictions, simulate
              road conditions, and review recent assessments.
            </p>
          </div>

          <div className="hero-badge">
            <span>●</span>

            <div>
              <strong>System Active</strong>

              <small>
                AI risk monitoring ready
              </small>
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <section className="prediction-error dashboard-error">
            <strong>Dashboard Error</strong>

            <p>{error}</p>
          </section>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="dashboard-stats">

          <div className="dashboard-stat-card">
            <span>Total Predictions</span>

            <strong>
              {loading ? "—" : totalPredictions}
            </strong>

            <small>
              All recorded assessments
            </small>
          </div>

          <div className="dashboard-stat-card stat-high">
            <span>High Risk</span>

            <strong>
              {loading ? "—" : highRiskCount}
            </strong>

            <small>
              High-risk assessments
            </small>
          </div>

          <div className="dashboard-stat-card stat-medium">
            <span>Medium Risk</span>

            <strong>
              {loading ? "—" : mediumRiskCount}
            </strong>

            <small>
              Moderate-risk assessments
            </small>
          </div>

          <div className="dashboard-stat-card stat-low">
            <span>Low Risk</span>

            <strong>
              {loading ? "—" : lowRiskCount}
            </strong>

            <small>
              Low-risk assessments
            </small>
          </div>

        </section>

        {/* =================================================
            CURRENT RISK + DISTRIBUTION
        ================================================= */}

        <section className="dashboard-current-section">

          {/* Current Risk */}

          <div className="dashboard-current-card">

            <div className="dashboard-section-heading">
              <div>
                <span className="section-label">
                  CURRENT RISK
                </span>

                <h2>Latest Assessment</h2>
              </div>
            </div>

            {latestPrediction ? (
              <div className="current-risk-content">

                <div
                  className={`current-risk-badge ${getRiskClass(
                    latestPrediction.predicted_risk
                  )}`}
                >
                  <span>RISK LEVEL</span>

                  <strong>
                    {latestPrediction.predicted_risk}
                  </strong>
                </div>

                <div className="current-risk-details">

                  <div className="confidence-display">
                    <span>Confidence</span>

                    <strong>
                      {latestPrediction.confidence}%
                    </strong>
                  </div>

                  <div className="risk-alert">
                    <strong>
                      {latestPrediction.predicted_risk ===
                      "High"
                        ? "🚨 HIGH RISK ALERT"
                        : latestPrediction.predicted_risk ===
                          "Medium"
                        ? "⚠️ CAUTION ALERT"
                        : "✓ LOW RISK"}
                    </strong>

                    <p>
                      {getRiskMessage(
                        latestPrediction.predicted_risk
                      )}
                    </p>
                  </div>

                  <small className="latest-time">
                    Last prediction:{" "}
                    {new Date(
                      latestPrediction.created_at
                    ).toLocaleString()}
                  </small>

                </div>
              </div>
            ) : (
              <div className="dashboard-empty">
                <h3>
                  No prediction available
                </h3>

                <p>
                  Generate your first road risk
                  prediction to see the current
                  assessment here.
                </p>

                <Link
                  to="/prediction"
                  className="dashboard-primary-link"
                >
                  Predict Road Risk →
                </Link>
              </div>
            )}

          </div>

          {/* Risk Distribution */}

          <div className="dashboard-distribution-card">

            <div className="dashboard-section-heading">
              <div>
                <span className="section-label">
                  ANALYTICS
                </span>

                <h2>Risk Distribution</h2>
              </div>
            </div>

            {totalPredictions > 0 ? (
              <div className="risk-distribution">

                <div className="distribution-row">
                  <div className="distribution-label">
                    <span className="distribution-dot dot-low"></span>

                    <span>Low</span>

                    <strong>
                      {lowPercentage}%
                    </strong>
                  </div>

                  <div className="distribution-bar">
                    <div
                      className="distribution-fill fill-low"
                      style={{
                        width: `${lowPercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="distribution-row">
                  <div className="distribution-label">
                    <span className="distribution-dot dot-medium"></span>

                    <span>Medium</span>

                    <strong>
                      {mediumPercentage}%
                    </strong>
                  </div>

                  <div className="distribution-bar">
                    <div
                      className="distribution-fill fill-medium"
                      style={{
                        width: `${mediumPercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="distribution-row">
                  <div className="distribution-label">
                    <span className="distribution-dot dot-high"></span>

                    <span>High</span>

                    <strong>
                      {highPercentage}%
                    </strong>
                  </div>

                  <div className="distribution-bar">
                    <div
                      className="distribution-fill fill-high"
                      style={{
                        width: `${highPercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="dashboard-empty">
                <p>
                  Risk distribution will appear after
                  predictions are generated.
                </p>
              </div>
            )}

          </div>

        </section>

        {/* =================================================
            LIVE RISK SIMULATION
        ================================================= */}

        <section className="dashboard-simulation">

          <div className="dashboard-section-heading">
            <div>
              <span className="section-label">
                LIVE RISK MONITORING
              </span>

              <h2>Traffic Risk Simulation</h2>

              <p>
                Simulate different road conditions and
                evaluate them using the RoadSense AI model.
              </p>
            </div>
          </div>

          {/* Scenario buttons */}

          <div className="simulation-scenarios">

            <button
              className={
                selectedScenario === "normal"
                  ? "simulation-scenario active"
                  : "simulation-scenario"
              }
              onClick={() =>
                setSelectedScenario("normal")
              }
            >
              <strong>Normal</strong>

              <span>
                Typical traffic conditions
              </span>
            </button>

            <button
              className={
                selectedScenario === "heavy"
                  ? "simulation-scenario active"
                  : "simulation-scenario"
              }
              onClick={() =>
                setSelectedScenario("heavy")
              }
            >
              <strong>Heavy Traffic</strong>

              <span>
                Increased traffic conditions
              </span>
            </button>

            <button
              className={
                selectedScenario === "critical"
                  ? "simulation-scenario active"
                  : "simulation-scenario"
              }
              onClick={() =>
                setSelectedScenario("critical")
              }
            >
              <strong>Critical</strong>

              <span>
                Severe road conditions
              </span>
            </button>

          </div>

          {/* Selected scenario details */}

          <div className="simulation-content">

            <div className="simulation-inputs">

              <div className="simulation-title-row">
                <div>
                  <span className="section-label">
                    SELECTED SCENARIO
                  </span>

                  <h3>
                    {scenarios[selectedScenario].name}
                  </h3>
                </div>
              </div>

              <p className="simulation-description">
                {
                  scenarios[selectedScenario]
                    .description
                }
              </p>

              <div className="simulation-metrics">

                <div className="simulation-metric">
                  <span>Traffic</span>

                  <strong>
                    {
                      scenarios[selectedScenario]
                        .traffic_density
                    }
                  </strong>
                </div>

                <div className="simulation-metric">
                  <span>Horn Events</span>

                  <strong>
                    {
                      scenarios[selectedScenario]
                        .horn_events_per_min
                    }
                    /min
                  </strong>
                </div>

                <div className="simulation-metric">
                  <span>Speed</span>

                  <strong>
                    {
                      scenarios[selectedScenario]
                        .avg_speed
                    }{" "}
                    km/h
                  </strong>
                </div>

                <div className="simulation-metric">
                  <span>Signal Wait</span>

                  <strong>
                    {
                      scenarios[selectedScenario]
                        .signal_wait_time
                    }{" "}
                    sec
                  </strong>
                </div>

                <div className="simulation-metric">
                  <span>Weather</span>

                  <strong>
                    {
                      scenarios[selectedScenario]
                        .weather_condition
                    }
                  </strong>
                </div>

                <div className="simulation-metric">
                  <span>Road Quality</span>

                  <strong>
                    {
                      scenarios[selectedScenario]
                        .road_quality_score
                    }
                    /10
                  </strong>
                </div>

                <div className="simulation-metric">
                  <span>Experience</span>

                  <strong>
                    {
                      scenarios[selectedScenario]
                        .driver_experience_level
                    }
                  </strong>
                </div>

                <div className="simulation-metric">
                  <span>Stress</span>

                  <strong>
                    {
                      scenarios[selectedScenario]
                        .stress_index
                    }
                  </strong>
                </div>

              </div>

              {!location && (
                <div className="simulation-location-warning">
                  <strong>
                    Location required
                  </strong>

                  <p>
                    Get your current location before
                    running the simulation.
                  </p>

                  <button
                    onClick={getLocation}
                    className="dashboard-location-button"
                  >
                    Get Current Location
                  </button>
                </div>
              )}

              <button
                className="simulation-run-button"
                onClick={runSimulation}
                disabled={
                  simulationLoading || !location
                }
              >
                {simulationLoading
                  ? "Analyzing Conditions..."
                  : "Run Live Simulation →"}
              </button>

            </div>

            {/* Simulation Result */}

            <div className="simulation-result">

              <span className="section-label">
                AI RESULT
              </span>

              {simulationResult ? (
                <>
                  <h3>
                    {simulationResult.scenarioName}
                  </h3>

                  <div
                    className={`simulation-risk-result ${getRiskClass(
                      simulationResult.predicted_risk
                    )}`}
                  >
                    <span>
                      PREDICTED RISK
                    </span>

                    <strong>
                      {
                        simulationResult.predicted_risk
                      }
                    </strong>

                    <small>
                      {
                        simulationResult.confidence
                      }% confidence
                    </small>
                  </div>

                  <div className="simulation-result-message">
                    <strong>
                      {simulationResult.predicted_risk ===
                      "High"
                        ? "🚨 HIGH RISK ALERT"
                        : simulationResult.predicted_risk ===
                          "Medium"
                        ? "⚠️ CAUTION ALERT"
                        : "✓ LOW RISK"}
                    </strong>

                    <p>
                      {getRiskMessage(
                        simulationResult.predicted_risk
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <div className="simulation-placeholder">
                  <div className="simulation-placeholder-icon">
                    ◈
                  </div>

                  <h3>
                    Ready for simulation
                  </h3>

                  <p>
                    Select a traffic scenario and run
                    the simulation to receive an AI-based
                    risk assessment.
                  </p>
                </div>
              )}

            </div>

          </div>

        </section>
        <section className="dashboard-section multi-location-section">
  <div className="section-heading">
    <div>
      <p className="section-kicker">DEMO MODE</p>
      <h2>Multi-Location Risk Simulation</h2>
      <p>
        Simulate traffic conditions across multiple locations using
        the RoadSense prediction pipeline.
      </p>
    </div>

    <button
      className="simulation-start-button"
      onClick={runMultiLocationSimulation}
      disabled={multiSimulationRunning}
    >
      {multiSimulationRunning
        ? "Simulation Running..."
        : "▶ Start Simulation"}
    </button>
  </div>

  <div className="simulation-disclaimer">
    Demo locations use simulated traffic conditions. Predictions are
    generated by the RoadSense Random Forest model.
  </div>

  <div className="multi-location-grid">
    {simulationLocations.map((location) => {
      const result = multiSimulationResults.find(
        (item) => item.location.id === location.id
      );

      const isRunning =
        currentSimulationLocation === location.id;

      const risk =
        result?.prediction?.predicted_risk || null;

      return (
        <div
          className={`location-simulation-card ${
            isRunning ? "simulation-active" : ""
          }`}
          key={location.id}
        >
          <div className="location-card-top">
            <div>
              <span className="location-number">
                {simulationLocations.indexOf(location) + 1}
              </span>

              <h3>{location.name}</h3>
            </div>

            {isRunning && (
              <span className="simulation-status">
                ANALYZING
              </span>
            )}
          </div>

          <p className="location-description">
            {location.description}
          </p>

          <div className="location-coordinates">
            {location.latitude.toFixed(4)},{" "}
            {location.longitude.toFixed(4)}
          </div>

          {result && (
            <div className="location-result">
              <span>Predicted Risk</span>

              <strong
                className={`risk-${risk?.toLowerCase()}`}
              >
                {risk}
              </strong>

              <span>
                Confidence: {result.prediction.confidence}%
              </span>
            </div>
          )}

          {!result && !isRunning && (
            <div className="location-waiting">
              Waiting for simulation
            </div>
          )}

          {isRunning && (
            <div className="location-processing">
              Processing traffic conditions...
            </div>
          )}
        </div>
      );
    })}
  </div>

  {multiSimulationResults.length ===
    simulationLocations.length && (
    <div className="simulation-complete">
      <div>
        <span className="section-kicker">SIMULATION COMPLETE</span>
        <h3>Multi-location analysis finished</h3>
      </div>

      <div className="simulation-summary">
        <div>
          <strong>
            {multiSimulationResults.length}
          </strong>
          <span>Locations</span>
        </div>

        <div>
          <strong>
            {
              multiSimulationResults.filter(
                (item) =>
                  item.prediction.predicted_risk === "Low"
              ).length
            }
          </strong>
          <span>Low Risk</span>
        </div>

        <div>
          <strong>
            {
              multiSimulationResults.filter(
                (item) =>
                  item.prediction.predicted_risk === "Medium"
              ).length
            }
          </strong>
          <span>Medium Risk</span>
        </div>

        <div>
          <strong>
            {
              multiSimulationResults.filter(
                (item) =>
                  item.prediction.predicted_risk === "High"
              ).length
            }
          </strong>
          <span>High Risk</span>
        </div>
      </div>
    </div>
  )}
</section>
        {/* =================================================
            RISK GAUGE
        ================================================= */}

        {simulationResult && (
          <section className="dashboard-gauge-section">

            <div className="dashboard-section-heading">
              <div>
                <span className="section-label">
                  RISK INDICATOR
                </span>

                <h2>
                  Simulation Risk Gauge
                </h2>
              </div>
            </div>

            <div className="risk-gauge-container">

              <div
                className={`risk-gauge-value ${getRiskClass(
                  simulationResult.predicted_risk
                )}`}
              >
                <strong>
                  {simulationResult.confidence}%
                </strong>

                <span>
                  Model Confidence
                </span>
              </div>

              <div className="risk-gauge">

                <div className="gauge-track">
                  <div className="gauge-low"></div>
                  <div className="gauge-medium"></div>
                  <div className="gauge-high"></div>
                </div>

                <div className="gauge-labels">
                  <span>LOW</span>
                  <span>MEDIUM</span>
                  <span>HIGH</span>
                </div>

                <div
                  className={`gauge-indicator ${getRiskClass(
                    simulationResult.predicted_risk
                  )}`}
                  style={{
                    left: getGaugeWidth(
                      simulationResult.predicted_risk
                    ),
                  }}
                >
                  <span></span>
                </div>

              </div>

              <div className="gauge-risk-status">

                <span>
                  Current Simulation Risk
                </span>

                <strong
                  className={getRiskClass(
                    simulationResult.predicted_risk
                  )}
                >
                  {
                    simulationResult.predicted_risk
                  }
                </strong>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            RECENT PREDICTIONS
        ================================================= */}

        <section className="dashboard-recent">

          <div className="dashboard-section-heading dashboard-heading-row">
            <div>
              <span className="section-label">
                ACTIVITY
              </span>

              <h2>Recent Predictions</h2>
            </div>

            <Link
              to="/history"
              className="dashboard-view-link"
            >
              View Full History →
            </Link>
          </div>

          {recentPredictions.length > 0 ? (
            <div className="recent-predictions-list">

              {recentPredictions.map((item) => (
                <div
                  className="recent-prediction-item"
                  key={item.id}
                >
                  <div className="recent-risk-info">

                    <span
                      className={`risk-badge ${getRiskClass(
                        item.predicted_risk
                      )}`}
                    >
                      {item.predicted_risk}
                    </span>

                    <div>
                      <strong>
                        {item.confidence}% confidence
                      </strong>

                      <small>
                        {item.weather_condition} ·{" "}
                        {item.avg_speed} km/h
                      </small>
                    </div>

                  </div>

                  <div className="recent-prediction-time">
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </div>

                </div>
              ))}

            </div>
          ) : (
            <div className="dashboard-empty">
              <h3>
                No recent predictions
              </h3>

              <p>
                Your prediction activity will appear
                here.
              </p>
            </div>
          )}

        </section>

        {/* =================================================
            CURRENT LOCATION
        ================================================= */}

        <section className="dashboard-location">

          <div className="dashboard-section-heading">
            <div>
              <span className="section-label">
                LOCATION
              </span>

              <h2>Current Location</h2>
            </div>
          </div>

          {location ? (
            <div className="dashboard-location-content">

              <div className="location-detected">
                <span className="location-status-dot">
                  ●
                </span>

                <div>
                  <strong>
                    Location detected
                  </strong>

                  <p>
                    Browser location available for
                    risk assessment.
                  </p>
                </div>
              </div>

              <div className="coordinates">
                <span>Latitude</span>

                <strong>
                  {location.latitude.toFixed(6)}
                </strong>

                <span>Longitude</span>

                <strong>
                  {location.longitude.toFixed(6)}
                </strong>
              </div>

              <Link
                to="/risk-map"
                className="dashboard-primary-link"
              >
                View Risk Map →
              </Link>

            </div>
          ) : (
            <div className="dashboard-location-content">

              <div className="location-empty-dashboard">
                <span>⌖</span>

                <div>
                  <strong>
                    Location not detected
                  </strong>

                  <p>
                    Get your current browser location
                    for location-based risk assessment.
                  </p>
                </div>
              </div>

              <button
                className="dashboard-location-button"
                onClick={getLocation}
              >
                Get Current Location
              </button>

            </div>
          )}

        </section>
          <section className="notification-settings-card">
  <div>
    <p className="section-kicker">SAFETY ALERTS</p>

    <h2>Mobile Safety Notifications</h2>

    <p>
      Receive RoadSense safety guidance when Medium or High
      risk conditions are detected.
    </p>
    <br></br>
  </div>

  <button
    className="simulation-start-button"
    onClick={handleEnableNotifications}
    disabled={notificationsEnabled}
  >
    {notificationsEnabled
      ? "✓ Notifications Enabled"
      : "Enable Safety Notifications"}
  </button>

  {notificationMessage && (
    <p className="notification-status">
      {notificationMessage}
    </p>
  )}
</section>
        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <section className="dashboard-section">

          <div className="section-heading">
            <div>
              <span className="section-label">
                EXPLORE
              </span>

              <h2>Quick Access</h2>
            </div>

            <p>
              Access the main RoadSense monitoring and
              analysis tools.
            </p>
          </div>

          <div className="dashboard-grid">

            <div className="dashboard-card">

              <div className="card-icon">⌖</div>

              <div className="card-content">
                <h3>Location</h3>

                <p>
                  Detect your current location and view
                  it on the interactive map.
                </p>

                <Link
                  to="/location"
                  className="card-link"
                >
                  View Location <span>→</span>
                </Link>
              </div>

            </div>

            <div className="dashboard-card featured-card">

              <div className="card-icon">◈</div>

              <div className="card-content">
                <h3>Risk Prediction</h3>

                <p>
                  Analyze traffic, road, environmental
                  and driver conditions using the AI model.
                </p>

                <Link
                  to="/prediction"
                  className="card-link"
                >
                  Predict Risk <span>→</span>
                </Link>
              </div>

            </div>

            <div className="dashboard-card">

              <div className="card-icon">◷</div>

              <div className="card-content">
                <h3>Prediction History</h3>

                <p>
                  Review previously generated road risk
                  predictions and their details.
                </p>

                <Link
                  to="/history"
                  className="card-link"
                >
                  View History <span>→</span>
                </Link>
              </div>

            </div>

            <div className="dashboard-card">

              <div className="card-icon">◎</div>

              <div className="card-content">
                <h3>Risk Map</h3>

                <p>
                  Explore geographical risk predictions
                  and regional risk information.
                </p>

                <Link
                  to="/risk-map"
                  className="card-link"
                >
                  Open Risk Map <span>→</span>
                </Link>
              </div>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;