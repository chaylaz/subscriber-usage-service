const usageForm =
  document.getElementById("usage-form");

const usageTableBody =
  document.getElementById("usage-table-body");

const recordCount =
  document.getElementById("record-count");

const formMessage =
  document.getElementById("form-message");

const submitButton =
  document.getElementById("submit-button");

const refreshButton =
  document.getElementById("refresh-button");

const apiStatus =
  document.getElementById("api-status");

const apiStatusText =
  document.getElementById("api-status-text");

const API_CHECK_INTERVAL = 2000;
const INITIAL_CHECKING_DURATION = 1200;

const sleep = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return "-";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
};

const setMessage = (message, type = "") => {
  formMessage.textContent = message;

  formMessage.className = "form-message";

  if (type) {
    formMessage.classList.add(type);
  }
};

const setApiStatus = (status) => {
  apiStatus.classList.remove(
    "checking",
    "connected",
    "unavailable"
  );

  if (status === "connected") {
    apiStatus.classList.add("connected");
    apiStatusText.textContent = "API Connected";
    apiStatus.title = "Backend API is available";

    return;
  }

  if (status === "unavailable") {
    apiStatus.classList.add("unavailable");
    apiStatusText.textContent = "API Unavailable";
    apiStatus.title = "Backend API cannot be reached";

    return;
  }

  apiStatus.classList.add("checking");
  apiStatusText.textContent = "Checking API...";
  apiStatus.title = "Checking API status";
};

const checkApiStatus = async () => {
  try {
    const response = await fetch("/", {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `API returned status ${response.status}.`
      );
    }

    setApiStatus("connected");

    return true;
  } catch (error) {
    setApiStatus("unavailable");

    return false;
  }
};

const renderRecords = (records) => {
  usageTableBody.innerHTML = "";

  recordCount.textContent =
    `${records.length} ${
      records.length === 1 ? "record" : "records"
    }`;

  if (records.length === 0) {
    usageTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          No usage records available.
        </td>
      </tr>
    `;

    return;
  }

  records.forEach((record) => {
    const row = document.createElement("tr");

    const subscriberCell =
      document.createElement("td");

    const callMinutesCell =
      document.createElement("td");

    const smsCountCell =
      document.createElement("td");

    const dataUsageCell =
      document.createElement("td");

    const timestampCell =
      document.createElement("td");

    subscriberCell.textContent =
      record.subscriberId;

    callMinutesCell.textContent =
      record.callMinutes;

    smsCountCell.textContent =
      record.smsCount;

    dataUsageCell.textContent =
      `${record.dataUsageMB} MB`;

    timestampCell.textContent =
      formatTimestamp(record.timestamp);

    row.append(
      subscriberCell,
      callMinutesCell,
      smsCountCell,
      dataUsageCell,
      timestampCell
    );

    usageTableBody.appendChild(row);
  });
};

const loadUsageRecords = async () => {
  refreshButton.disabled = true;

  try {
    const response = await fetch("/usage", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}.`
      );
    }

    const result = await response.json();

    const records = Array.isArray(result)
      ? result
      : result.data;

    renderRecords(
      Array.isArray(records) ? records : []
    );

    setApiStatus("connected");
  } catch (error) {
    usageTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          Failed to load usage records.
        </td>
      </tr>
    `;

    recordCount.textContent = "Unavailable";

    setApiStatus("unavailable");

    console.error(error);
  } finally {
    refreshButton.disabled = false;
  }
};

usageForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    setMessage("");

    submitButton.disabled = true;

    const formData =
      new FormData(usageForm);

    const payload = {
      subscriberId:
        formData.get("subscriberId").trim(),

      callMinutes:
        Number(formData.get("callMinutes")),

      smsCount:
        Number(formData.get("smsCount")),

      dataUsageMB:
        Number(formData.get("dataUsageMB"))
    };

    try {
      const response = await fetch("/usage", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          Array.isArray(result.errors)
            ? result.errors.join(" ")
            : result.message ||
              "Unable to create usage record.";

        throw new Error(errorMessage);
      }

      setApiStatus("connected");

      setMessage(
        "Usage record added successfully.",
        "success"
      );

      usageForm.reset();

      await loadUsageRecords();
    } catch (error) {
      setApiStatus("unavailable");

      setMessage(
        error.message,
        "error"
      );
    } finally {
      submitButton.disabled = false;
    }
  }
);

refreshButton.addEventListener(
  "click",
  async () => {
    await checkApiStatus();
    await loadUsageRecords();
  }
);

const initializePage = async () => {
  setApiStatus("checking");

  const statusCheck = checkApiStatus();

  await sleep(INITIAL_CHECKING_DURATION);

  await statusCheck;

  await loadUsageRecords();
};

initializePage();

setInterval(
  checkApiStatus,
  API_CHECK_INTERVAL
);