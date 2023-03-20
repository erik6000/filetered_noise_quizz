const quizData = [
    { low: 11.0, high: 22.1, center: 16 },
    { low: 22.1, high: 44.2, center: 31.5 },
    { low: 44.2, high: 88.4, center: 63 },
    { low: 88.4, high: 176.8, center: 125 },
    { low: 176.8, high: 353.6, center: 250 },
    { low: 353.6, high: 707.1, center: 500 },
    { low: 707.1, high: 1414.2, center: 1000 },
    { low: 1412.2, high: 2828.4, center: 2000 },
    { low: 2828.4, high: 5656.9, center: 4000 },
    { low: 5656.9, high: 11313.7, center: 8000 },
    { low: 11313.7, high: 22627.4, center: 16000 },
];


function createFilteredWhiteNoise(lowFreq, highFreq, duration = 5, sampleRate = 44100) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const whiteNoise = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const samples = whiteNoise.getChannelData(0);

    for (let i = 0; i < samples.length; i++) {
        samples[i] = Math.random() * 2 - 1;
    }

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = Math.sqrt(lowFreq * highFreq);
    filter.Q.value = filter.frequency.value / (highFreq - lowFreq);

    const source = audioContext.createBufferSource();
    source.buffer = whiteNoise;
    source.connect(filter);
    filter.connect(audioContext.destination);
    
    return source;
}

function getNextFilteredNoise() {
    if (quizData.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * quizData.length);
    const selectedBand = quizData.splice(randomIndex, 1)[0];
    const audioBuffer = createFilteredWhiteNoise(selectedBand.low, selectedBand.high);
    audioBuffer.band = selectedBand;
    return audioBuffer;
}
function flashFeedback(color, centerFrequency) {
    const feedback = document.getElementById('feedback');
    feedback.style.backgroundColor = color;
    feedback.style.display = 'block';

    const centerFrequencyElement = document.getElementById('centerFrequency');
    centerFrequencyElement.innerText = centerFrequency;
    centerFrequencyElement.style.display = 'block';

    setTimeout(() => {
        feedback.style.display = 'none';
        centerFrequencyElement.style.display = 'none';
    }, 1000);
}




document.getElementById('startQuiz').addEventListener('click', () => {
    document.getElementById('startQuiz').style.display = 'none';
    document.getElementById('questionText').style.display = 'block';
    document.getElementById('playAudio').style.display = 'block';

    let correctAnswers = 0;
    let totalQuestions = quizData.length;
    let currentSource = getNextFilteredNoise();
	
	function playNextSound() {
		if (!currentSource) {
			alert(`Quiz finished! You scored ${correctAnswers} out of ${totalQuestions}`);
			return;
		}
		currentSource.start();
		setTimeout(() => {
			currentSource.stop();
			const answer = prompt('Enter a frequency within the range (e.g., "23"):');
			if (answer) {
				const frequency = Number(answer);
				const found = currentSource.band.low <= frequency && currentSource.band.high >= frequency;

				if (found) {
					flashFeedback('green', currentSource.band.center);
					correctAnswers++;
				} else {
					flashFeedback('red', currentSource.band.center);
				}
			}
			currentSource = getNextFilteredNoise();
		}, 5000);
	}
    

    document.getElementById('playAudio').addEventListener('click', playNextSound);
    document.getElementById('nextQuestion').addEventListener('click', playNextSound);
});




