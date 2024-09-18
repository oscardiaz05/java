let questions = [];
let currentExam = [];

document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    
    document.getElementById('startExam').addEventListener('click', startExam);
    document.getElementById('submitExam').addEventListener('click', submitExam);
    document.getElementById('restartExam').addEventListener('click', restartExam);
});

async function loadQuestions() {
    try {
        console.log('Iniciando carga de preguntas...');
        const response = await fetch('preguntas.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        console.log('Datos CSV cargados:', data);

        const rows = data.split('\n').filter(row => row.trim() !== '');
        console.log('Número de filas (incluyendo encabezado):', rows.length);

        if (rows.length < 2) {
            console.error('El archivo CSV está vacío o solo contiene el encabezado');
            return;
        }

        questions = rows.slice(1).map((row, index) => {
            const [topic, question, correctOption, ...options] = row.split(',');
            if (!topic || !question || !correctOption || options.length < 4) {
                console.error(`Fila ${index + 2} mal formateada:`, row);
                return null;
            }
            return { topic, question, correctOption, options };
        }).filter(q => q !== null);

        console.log('Preguntas cargadas:', questions);

        if (questions.length === 0) {
            console.error('No se pudieron cargar preguntas válidas');
            return;
        }

        updateTopics();
        console.log('Carga de preguntas completada');
    } catch (error) {
        console.error('Error al cargar las preguntas:', error);
    }
}

function updateTopics() {
    const topics = [...new Set(questions.map(q => q.topic))];
    console.log('Temas encontrados:', topics);
    const topicSelect = document.getElementById('topic');
    topicSelect.innerHTML = '<option value="todos">Todos los temas</option>';
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        topicSelect.appendChild(option);
    });
}

function startExam() {
    const numQuestions = parseInt(document.getElementById('numQuestions').value);
    const topic = document.getElementById('topic').value;
    
    console.log(`Iniciando examen con ${numQuestions} preguntas sobre el tema: ${topic}`);
    
    let availableQuestions = topic === 'todos' 
        ? questions 
        : questions.filter(q => q.topic === topic);
    
    console.log(`Preguntas disponibles: ${availableQuestions.length}`);
    
    currentExam = [];
    for (let i = 0; i < numQuestions && availableQuestions.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        currentExam.push(availableQuestions.splice(randomIndex, 1)[0]);
    }
    
    console.log(`Examen generado con ${currentExam.length} preguntas`);
    
    displayExam();
}

function displayExam() {
    const examContainer = document.getElementById('questions');
    examContainer.innerHTML = '';
    
    currentExam.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `
            <p>${index + 1}. ${q.question}</p>
            ${q.options.map((option, i) => `
                <label>
                    <input type="radio" name="q${index}" value="${String.fromCharCode(65 + i)}">
                    ${String.fromCharCode(65 + i)}. ${option}
                </label>
            `).join('')}
        `;
        examContainer.appendChild(questionDiv);
    });
    
    document.getElementById('setup').style.display = 'none';
    document.getElementById('exam').style.display = 'block';
}

function submitExam() {
    let score = 0;
    currentExam.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        if (selected && selected.value === q.correctOption) {
            score++;
        }
    });
    
    document.getElementById('score').textContent = `${score} / ${currentExam.length}`;
    document.getElementById('exam').style.display = 'none';
    document.getElementById('results').style.display = 'block';
}

function restartExam() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('setup').style.display = 'block';
}
