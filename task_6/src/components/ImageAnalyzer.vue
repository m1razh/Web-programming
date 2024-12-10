<template>
  <div style="text-align: center;">
    <h3>Выберите изображение из файла</h3>
    <input type="file" @change="onFileChange" accept="image/jpeg" />

    <div v-if="imageSrc">
      <img :src="imageSrc" alt="Uploaded Image" style="max-width: 100%; margin: 20px 0;" />

      <div>
        <h4>Гистограмма</h4>
        <label>
          <input type="radio" value="sum" v-model="mode" /> Суммарная
        </label>
        <label>
          <input type="radio" value="all" v-model="mode" /> Все каналы
        </label>

        <svg width="300" height="180" style="background: #f8f8f8;">
          <!-- Подписи к осям -->
          <text x="10" y="170" font-family="Arial" font-size="12" fill="black">255</text>
          <text x="290" y="170" font-family="Arial" font-size="12" fill="black" text-anchor="end">0</text>
          <text x="140" y="175" font-family="Arial" font-size="12" fill="black" text-anchor="middle">Интенсивность</text>
          <text x="150" y="15" font-family="Arial" font-size="12" fill="black" text-anchor="middle">Количество пикселей</text>

          <!-- Вертикальная направляющая по середине -->
          <line x1="150" y1="0" x2="150" y2="150" stroke="black" stroke-width="1" />

          <line
            v-for="(value, index) in displayedHistogram('c')"
            :key="'c' + index"
            :x1="300 - index"
            y1="150"
            :x2="300 - index"
            :y2="150 - value"
            stroke="cyan"
            :stroke-width="1"
            stroke-opacity="0.5"
          />
          <line
            v-for="(value, index) in displayedHistogram('m')"
            :key="'m' + index"
            :x1="300 - index"
            y1="150"
            :x2="300 - index"
            :y2="150 - value"
            stroke="magenta"
            :stroke-width="1"
            stroke-opacity="0.5"
          />
          <line
            v-for="(value, index) in displayedHistogram('y')"
            :key="'y' + index"
            :x1="300 - index"
            y1="150"
            :x2="300 - index"
            :y2="150 - value"
            stroke="yellow"
            :stroke-width="1"
            stroke-opacity="0.5"
          />
          <line
            v-for="(value, index) in displayedHistogram('k')"
            :key="'k' + index"
            :x1="300 - index"
            y1="150"
            :x2="300 - index"
            :y2="150 - value"
            stroke="black"
            :stroke-width="1"
            stroke-opacity="0.5"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
// Функция для преобразования RGB в CMYK
function rgbToCmyk(r, g, b) {
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);
  let k = Math.min(c, Math.min(m, y));

  if (k === 1) return [0, 0, 0, 1];

  c = (c - k) / (1 - k);
  m = (m - k) / (1 - k);
  y = (y - k) / (1 - k);

  return [c, m, y, k];
}

export default {
  data() {
    return {
      imageSrc: null,
      histogramData: { c: [], m: [], y: [], k: [] },
      mode: 'sum', // Default mode
    };
  },
  computed: {
    displayedHistogram() {
      return (channel) => {
        if (this.mode === 'sum') {
          return this.histogramData.k;
        }
        return this.histogramData[channel];
      };
    },
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.imageSrc = event.target.result;
          this.$nextTick(() => {
            this.analyzeImage();
          });
        };
        reader.readAsDataURL(file);
      }
    },
    analyzeImage() {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const image = new Image();
      image.src = this.imageSrc;

      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, image.width, image.height);
        const imageData = context.getImageData(0, 0, image.width, image.height);
        const { data } = imageData;

        const histogramC = new Array(256).fill(0);
        const histogramM = new Array(256).fill(0);
        const histogramY = new Array(256).fill(0);
        const histogramK = new Array(256).fill(0);

        for (let i = 0; i < data.length; i += 4) {
          const [c, m, y, k] = rgbToCmyk(data[i], data[i + 1], data[i + 2]);

          histogramC[Math.floor(c * 255)]++;
          histogramM[Math.floor(m * 255)]++;
          histogramY[Math.floor(y * 255)]++;
          histogramK[Math.floor(k * 255)]++;
        }

        const maxK = Math.max(...histogramK);
        this.histogramData = {
          c: histogramC.map(v => 150 * v / maxK),
          m: histogramM.map(v => 150 * v / maxK),
          y: histogramY.map(v => 150 * v / maxK),
          k: histogramK.map(v => 150 * v / maxK),
        };
      };
    },
  },
};
</script>

<style>
/* Стили */
input[type="file"] {
  margin: 10px 0;
}

svg {
  border: 1px solid #ddd;
  margin-top: 10px;
}
</style>