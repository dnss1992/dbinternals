document.addEventListener("DOMContentLoaded", function() {
    const searchBtn = document.getElementById('searchBtn');
    searchBtn.addEventListener('click', performSemanticSearch);
});

function performSemanticSearch() {
    const paragraph = document.getElementById('paragraphInput').value;
    const query = document.getElementById('queryInput').value;
    const queryText = document.getElementById('queryText');
    const embeddingText = document.getElementById('embeddingText');
    const similarityText = document.getElementById('similarityText');
    const finalResults = document.getElementById('finalResults');
    const barChart = document.getElementById('barChart');
    const wordCloud = document.getElementById('wordCloud');

    if (paragraph && query) {
        queryText.textContent = `Query: ${query}`;
        const paragraphSentences = paragraph.split('.').map(s => s.trim()).filter(s => s);
        const paragraphEmbeddings = paragraphSentences.map(sentence => transformToEmbedding(sentence));
        const queryEmbedding = transformToEmbedding(query, paragraphEmbeddings[0].length);
        embeddingText.textContent = `Query Embedding: [${queryEmbedding.join(', ')}]`;
        const results = findNearestNeighbors(paragraphEmbeddings, queryEmbedding, paragraphSentences);
        similarityText.textContent = `Cosine Similarities: ${results.similarities.map(s => s.toFixed(2)).join(', ')}`;
        finalResults.innerHTML = `Results: ${results.nearestNeighbors.map(sentence => highlightText(sentence, query)).join(' ')}`;

        displayBarChart(results.similarities);
        displayWordCloud(paragraph);
        displayProcess();
    }
}

function transformToEmbedding(text, vectorLength) {
    const words = text.split(' ').filter(word => word);
    const embeddings = words.map(word => {
        return word.split('').map(char => char.charCodeAt(0));
    });

    const averagedEmbedding = new Array(vectorLength || Math.max(...embeddings.map(e => e.length))).fill(0);
    embeddings.forEach(embedding => {
        embedding.forEach((value, index) => {
            if (index < averagedEmbedding.length) {
                averagedEmbedding[index] += value / embeddings.length;
            }
        });
    });
    return averagedEmbedding;
}

function cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, aVal, idx) => sum + aVal * b[idx], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    if (magnitudeA === 0 || magnitudeB === 0) return 0; // To avoid division by zero
    return dotProduct / (magnitudeA * magnitudeB);
}

function findNearestNeighbors(paragraphEmbeddings, queryEmbedding, sentences) {
    const similarities = paragraphEmbeddings.map(embedding => cosineSimilarity(embedding, queryEmbedding));
    const sortedIndexes = similarities.map((sim, idx) => [sim, idx]).sort((a, b) => b[0] - a[0]).map(pair => pair[1]);
    const nearestNeighbors = sortedIndexes.slice(0, 3).map(idx => sentences[idx]);
    return { nearestNeighbors, similarities };
}

function highlightText(text, query) {
    const queryWords = query.split(' ').filter(word => word);
    const highlightedText = text.split(' ').map(word => {
        return queryWords.includes(word) ? `<span class="highlight">${word}</span>` : word;
    }).join(' ');
    return `<p>${highlightedText}</p>`;
}

function displayBarChart(similarities) {
    const svg = d3.select("#barChart"),
          margin = {top: 20, right: 20, bottom: 30, left: 40},
          width = +svg.attr("width") - margin.left - margin.right,
          height 
