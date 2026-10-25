function checkURL() {

    const input =
        document.getElementById("urlInput");

    const result =
        document.getElementById("result");

    const url =
        input.value.trim();


    if (url === "") {

        result.innerHTML = `
            <div class="result-box">

                <h3 class="warning">
                    ⚠ URL Belum Dimasukkan
                </h3>

                <p>
                    Silakan masukkan URL website
                    terlebih dahulu.
                </p>

            </div>
        `;

        return;
    }


    let score = 0;

    let indicators = [];


    /* HTTPS */

    if (
        !url
            .toLowerCase()
            .startsWith("https://")
    ) {

        score += 25;

        indicators.push(
            "Website tidak menggunakan HTTPS."
        );

    }


    /* PANJANG URL */

    if (url.length > 75) {

        score += 20;

        indicators.push(
            "URL memiliki panjang yang mencurigakan."
        );

    }


    /* SIMBOL @ */

    if (url.includes("@")) {

        score += 25;

        indicators.push(
            "URL mengandung simbol @."
        );

    }


    /* IP ADDRESS */

    const ipPattern =
        /https?:\/\/\d{1,3}(\.\d{1,3}){3}/;


    if (ipPattern.test(url)) {

        score += 30;

        indicators.push(
            "URL menggunakan alamat IP."
        );

    }


    /* KATA MENCURIGAKAN */

    const suspiciousWords = [

        "login",
        "verify",
        "verification",
        "account",
        "secure",
        "update",
        "password",
        "confirm"

    ];


    let foundWords = [];


    suspiciousWords.forEach(
        function(word) {

            if (
                url
                    .toLowerCase()
                    .includes(word)
            ) {

                foundWords.push(word);

            }

        }
    );


    if (foundWords.length >= 2) {

        score += 20;

        indicators.push(

            "Ditemukan kata yang perlu diperhatikan: " +

            foundWords.join(", ")

        );

    }


    if (score > 100) {

        score = 100;

    }


    /* STATUS */

    let status;

    let statusClass;


    if (score < 30) {

        status =
            "🟢 Risiko Rendah";

        statusClass =
            "safe";

    }

    else if (score < 60) {

        status =
            "🟡 Risiko Sedang";

        statusClass =
            "warning";

    }

    else {

        status =
            "🔴 Risiko Tinggi";

        statusClass =
            "danger";

    }


    if (indicators.length === 0) {

        indicators.push(
            "Tidak ditemukan indikator mencurigakan."
        );

    }


    /* HASIL */

    result.innerHTML = `

        <div class="result-box">

            <h3 class="${statusClass}">
                ${status}
            </h3>


            <p>

                <strong>URL:</strong>

                ${escapeHTML(url)}

            </p>


            <p style="margin-top: 15px;">

                <strong>
                    Risk Score:
                </strong>

                ${score}%

            </p>


            <div style="margin-top: 20px;">

                <strong>
                    Security Indicators:
                </strong>


                <ul class="analysis-list">

                    ${
                        indicators
                        .map(function(item) {

                            return `
                                <li>
                                    ${item}
                                </li>
                            `;

                        })
                        .join("")
                    }

                </ul>

            </div>


            <div class="note">

                <strong>Catatan:</strong>

                Analisis ini menggunakan indikator
                sederhana pada URL dan bukan jaminan
                bahwa website benar-benar aman atau
                berbahaya.

            </div>

        </div>

    `;


    saveHistory(
        url,
        score,
        status
    );

}


/* =========================
   HISTORY
========================= */

function saveHistory(
    url,
    score,
    status
) {

    let history =

        JSON.parse(
            localStorage.getItem(
                "phishingHistory"
            )
        ) || [];


    const newData = {

        url: url,

        score: score,

        status: status,

        date:
            new Date()
            .toLocaleString("id-ID")

    };


    history.unshift(newData);


    if (history.length > 10) {

        history =
            history.slice(0, 10);

    }


    localStorage.setItem(

        "phishingHistory",

        JSON.stringify(history)

    );


    displayHistory();

    updateDashboard();

}


/* =========================
   DISPLAY HISTORY
========================= */

function displayHistory() {

    const historyList =
        document.getElementById(
            "historyList"
        );


    if (!historyList) {

        return;

    }


    const history =

        JSON.parse(
            localStorage.getItem(
                "phishingHistory"
            )
        ) || [];


    if (history.length === 0) {

        historyList.innerHTML = `

            <div class="empty-history">

                Belum ada URL yang diperiksa.

            </div>

        `;

        return;

    }


    historyList.innerHTML =

        history
        .map(function(item) {

            let colorClass =
                "safe";


            if (item.score >= 60) {

                colorClass =
                    "danger";

            }

            else if (item.score >= 30) {

                colorClass =
                    "warning";

            }


            return `

                <div class="history-item">

                    <div>

                        <div class="history-url">

                            ${escapeHTML(item.url)}

                        </div>


                        <div class="history-date">

                            ${item.date}

                        </div>

                    </div>


                    <div class="history-result">

                        <div class="history-score">

                            ${item.score}%

                        </div>


                        <div
                            class="${colorClass}
                            history-status"
                        >

                            ${item.status}

                        </div>

                    </div>

                </div>

            `;

        })
        .join("");

}


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {

    const totalCount =
        document.getElementById(
            "totalCount"
        );

    const lowCount =
        document.getElementById(
            "lowCount"
        );

    const mediumCount =
        document.getElementById(
            "mediumCount"
        );

    const highCount =
        document.getElementById(
            "highCount"
        );

    const latestChecks =
        document.getElementById(
            "latestChecks"
        );


    if (
        !totalCount ||
        !lowCount ||
        !mediumCount ||
        !highCount ||
        !latestChecks
    ) {

        return;

    }


    const history =

        JSON.parse(
            localStorage.getItem(
                "phishingHistory"
            )
        ) || [];


    totalCount.textContent =
        history.length;


    let low = 0;

    let medium = 0;

    let high = 0;


    history.forEach(
        function(item) {

            if (item.score < 30) {

                low++;

            }

            else if (item.score < 60) {

                medium++;

            }

            else {

                high++;

            }

        }
    );


    lowCount.textContent =
        low;

    mediumCount.textContent =
        medium;

    highCount.textContent =
        high;


    /* RECENT ACTIVITY */

    if (history.length === 0) {

        latestChecks.innerHTML = `

            <div class="empty-history">

                Belum ada pemeriksaan.

            </div>

        `;

        return;

    }


    const latest =
        history.slice(0, 5);


    latestChecks.innerHTML =

        latest
        .map(function(item) {

            let colorClass =
                "safe";


            if (item.score >= 60) {

                colorClass =
                    "danger";

            }

            else if (item.score >= 30) {

                colorClass =
                    "warning";

            }


            return `

                <div class="latest-item">

                    <div>

                        <div class="latest-url">

                            ${escapeHTML(item.url)}

                        </div>

                        <div class="latest-date">

                            ${item.date}

                        </div>

                    </div>


                    <div
                        class="latest-score
                        ${colorClass}"
                    >

                        ${item.score}%

                        <br>

                        ${item.status}

                    </div>

                </div>

            `;

        })
        .join("");

}


/* =========================
   CLEAR HISTORY
========================= */

function clearHistory() {

    const confirmDelete =

        confirm(
            "Yakin ingin menghapus semua riwayat?"
        );


    if (!confirmDelete) {

        return;

    }


    localStorage.removeItem(
        "phishingHistory"
    );


    displayHistory();

    updateDashboard();

}


/* =========================
   SECURITY
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================
   START
========================= */

displayHistory();

updateDashboard();