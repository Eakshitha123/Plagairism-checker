document.getElementById("file-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const file1 = document.getElementById("file1").files[0];
    const file2 = document.getElementById("file2").files[0];
    if (file1 && file2) {
        // Display loading spinner
        document.getElementById("loadingSpinner").style.display = "block";

        // Read file contents
        Promise.all([readFile(file1), readFile(file2)]).then((contents) => {
            const [text1, text2] = contents;

            // Check for plagiarism
            const results = checkPlagiarism(text1, text2);

            // Display results
            displayResults(results);
            document.getElementById("loadingSpinner").style.display = "none";
        });
    }
});

function readFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsText(file);
    });
}

function checkPlagiarism(text1, text2) {
    // Split text into sets of words for more efficient comparison
    const words1 = new Set(text1.toLowerCase().match(/\b\w+\b/g));
    const words2 = new Set(text2.toLowerCase().match(/\b\w+\b/g));
    
    // Find common words (plagiarized) using set intersection
    const matchedWords = [...words1].filter(word => words2.has(word));
    
    // Calculate plagiarism percentage based on unique words count in both files
    const uniqueWordCount = new Set([...words1, ...words2]).size;
    const plagiarismPercentage = (matchedWords.length / uniqueWordCount) * 100;

    return {
        plagiarismPercentage: plagiarismPercentage.toFixed(2),
        matchedWords,
    };
}

function displayResults({ plagiarismPercentage, matchedWords }) {
    // Update the plagiarism percentage result
    document.getElementById("plagiarism-percentage").querySelector(".percentage").textContent = `${plagiarismPercentage}%`;

    // Generate a pie chart for plagiarism percentage
    const ctx = document.getElementById("plagiarismChart").getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Plagiarized", "Unique"],
            datasets: [
                {
                    data: [plagiarismPercentage, 100 - plagiarismPercentage],
                    backgroundColor: ["#FF6347", "#36A2EB"],
                },
            ],
        },
    });

    // Display plagiarized text
    const plagiarizedTextContainer = document.getElementById("plagiarized-text");
    plagiarizedTextContainer.innerHTML = "";

    matchedWords.forEach(word => {
        const span = document.createElement("span");
        span.textContent = `${word} `;
        span.classList.add("highlight");
        plagiarizedTextContainer.appendChild(span);
    });
}

// Clear button functionality to reset form and clear results
document.getElementById("clearBtn").addEventListener("click", () => {
    document.getElementById("file1").value = "";
    document.getElementById("file2").value = "";
    document.getElementById("plagiarism-percentage").querySelector(".percentage").textContent = "-";
    document.getElementById("plagiarismChart").getContext("2d").clearRect(0, 0, 300, 300);
    document.getElementById("plagiarized-text").innerHTML = "";
    document.getElementById("results").reset();
});

// Download report functionality to save results as a text file
document.getElementById("downloadBtn").addEventListener("click", () => {
    const report = `
        Plagiarism Percentage: ${document.getElementById("plagiarism-percentage").querySelector(".percentage").textContent}
        Plagiarized Words: ${document.getElementById("plagiarized-text").textContent}
    `;
    const blob = new Blob([report], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plagiarism_report.txt";
    link.click();
});
