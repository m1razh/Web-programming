<template>
  <div class="container">
    <div class="controls">
      <label for="N">Количество вершин (N): </label>
      <input type="number" v-model.number="N" min="3" max="10" id="N">
      <label for="n">Количество точек (n): </label>
      <input type="number" v-model.number="n" min="1000" max="50000" id="n">
      <label for="d">Коэффициент (d): </label>
      <input type="number" v-model.number="d" min="1" max="10" step="0.1" id="d">
      <label for="R">Радиус (R): </label>
      <input type="number" v-model.number="R" min="1" max="20" step="0.1" id="R">
      <label for="sX">Смещение по X (sX): </label>
      <input type="number" v-model.number="sX" min="0" max="20" step="0.1" id="sX">
      <label for="sY">Смещение по Y (sY): </label>
      <input type="number" v-model.number="sY" min="0" max="20" step="0.1" id="sY">
      <button @click="drawN">Перерисовать</button>
    </div>
    <div class="svg-container">
      <svg :width="X * 0.6" :height="Y * 0.6">
        <rect v-for="(r, index) in rs" 
              :key="index"
              :fill="r.color"
              fill-opacity="1"
              :x="r.x" 
              :y="r.y" 
              width="1" 
              height="1"/>
      </svg>
      <svg :width="X * 0.9" :height="Y * 0.9">
        <rect v-for="(r, index) in rs" 
              :key="index"
              :fill="r.color"
              fill-opacity="1"
              :x="r.x" 
              :y="r.y" 
              width="1" 
              height="1"/>
      </svg>
    </div>
    <div class="chart-container">
      <canvas id="performanceChart"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, markRaw } from 'vue';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  setup() {
    const X = ref(500);
    const Y = ref(500);
    const d = ref(1.6);
    const N = ref(5);
    const n = ref(50000);
    const R = ref(300);
    const sX = ref(10);
    const sY = ref(10);
    const rs = ref([]);
    const previousPoint = ref(null);
    const diagonalLength = ref(Math.sqrt(500 * 500 + 500 * 500) / 2); // Половина длины диагонали
    const performanceData = markRaw({
      N: [],
      n: [],
      d: [],
      R: [],
      sX: [],
      sY: [],
      time: []
    });

    const drawN = async () => {
      rs.value = [];
      let startTime = performance.now();

      const response = await fetch('http://localhost:3000/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          N: N.value,
          n: n.value,
          d: d.value,
          R: R.value,
          sX: sX.value,
          sY: sY.value
        })
      });

      rs.value = await response.json();

      let endTime = performance.now();
      let timeTaken = endTime - startTime;

      performanceData.N.push(N.value);
      performanceData.n.push(n.value);
      performanceData.d.push(d.value);
      performanceData.R.push(R.value);
      performanceData.sX.push(sX.value);
      performanceData.sY.push(sY.value);
      performanceData.time.push(timeTaken);

      updateChart();

      let now = new Date();
      console.log("Завершено построение: " + now + " мс: " + now.getMilliseconds());
    };

    const getPointColor = (newPoint) => {
      if (previousPoint.value) {
        let distance = Math.sqrt(Math.pow(newPoint.x - previousPoint.value.x, 2) + Math.pow(newPoint.y - previousPoint.value.y, 2));
        if (distance > diagonalLength.value) {
          return getRandomColor();
        }
      }
      previousPoint.value = newPoint;
      return "#000000";
    };

    const getRandomColor = () => {
      return '#' + Math.floor(Math.random() * 16777215).toString(16);
    };

    let chart = null;

    const updateChart = () => {
      if (chart) {
        chart.destroy();
      }

      chart = new Chart(document.getElementById('performanceChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: performanceData.time.map((_, i) => `Run ${i + 1}`),
          datasets: [
            {
              label: 'Время выполнения (мс)',
              data: performanceData.time,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    };

    return {
      X,
      Y,
      d,
      N,
      n,
      R,
      sX,
      sY,
      rs,
      previousPoint,
      diagonalLength,
      performanceData,
      drawN,
      getPointColor,
      getRandomColor,
      updateChart
    };
  },
  created() {
    let now = new Date();
    console.log("Начато построение: " + now + " мс: " + now.getMilliseconds());
    this.drawN();
  },
  mounted() {
    let now = new Date();
    console.log("Отображено на странице: " + now + " мс: " + now.getMilliseconds());
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
}
.controls label {
  margin-right: 10px;
  font-weight: bold;
}
.controls input {
  width: 60px;
  margin-right: 20px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.controls button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.controls button:hover {
  background-color: #45a049;
}
.svg-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
}
svg {
  border: 1px solid #000000;
  background-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin: 10px;
}
.chart-container {
  width: 80%;
  margin-top: 20px;
}
</style>