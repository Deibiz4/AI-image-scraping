class ImageProcessor {
  constructor() {
    this.images = [];
    this.processedData = [];
    this.MAX_FILE_SIZE_MB = 5; // Máximo permitido por imagen
    this.initializeElements();
    if (this.allElementsPresent) this.bindEvents();
  }

  initializeElements() {
    const requiredIds = [
      "dropZone", "fileInput", "progressSection", "progressFill", "progressText",
      "previewSection", "imageGrid", "resultsSection", "resultsTableBody",
      "downloadBtn", "clearBtn", "processBtn", "visionApiKey"
    ];
    this.allElementsPresent = true;
    for (const id of requiredIds) {
      this[id] = document.getElementById(id);
      if (!this[id]) {
        console.error(`Elemento faltante: #${id}`);
        alert(`Error: No se encontró el elemento con id "${id}". Por favor revisa tu HTML.`);
        this.allElementsPresent = false;
      }
    }
  }

  bindEvents() {
    // Drag & Drop mejorado
    this.dropZone.addEventListener("click", (e) => {
      e.preventDefault();
      this.fileInput.click();
    });

    this.dropZone.addEventListener("dragenter", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.add("dragover");
    });

    this.dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.add("dragover");
    });

    // Use relatedTarget robustly, fallback if undefined
    this.dropZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (
        !e.relatedTarget ||
        !this.dropZone.contains(e.relatedTarget)
      ) {
        this.dropZone.classList.remove("dragover");
      }
    });

    this.dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.remove("dragover");
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image")
      );
      if (files.length) this.prepareFiles(files);
    });

    document.addEventListener("dragover", (e) => e.preventDefault());
    document.addEventListener("drop", (e) => e.preventDefault());

    // File input event
    this.fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files).filter((f) =>
        f.type.startsWith("image")
      );
      if (files.length) this.prepareFiles(files);
    });

    // Button events
    if (this.downloadBtn) this.downloadBtn.addEventListener("click", () => this.downloadCSV());
    if (this.clearBtn) this.clearBtn.addEventListener("click", () => this.clearAll());
    if (this.processBtn)
      this.processBtn.addEventListener("click", () => {
        if (this.images.length === 0)
          return alert("Por favor añade imágenes primero");
        const key = this.visionApiKey.value.trim();
        if (!key) return alert("Por favor ingresa tu clave API de Google Vision");
        this.processWithVision(key);
      });
  }

  prepareFiles(files) {
    // Nuevo: filtra archivos demasiado grandes
    const oversized = files.filter((f) => f.size / (1024 * 1024) > this.MAX_FILE_SIZE_MB);
    if (oversized.length) {
      alert(
        `Algunos archivos exceden el tamaño máximo permitido (${this.MAX_FILE_SIZE_MB}MB) y no serán cargados.`
      );
    }
    files = files.filter((f) => f.size / (1024 * 1024) <= this.MAX_FILE_SIZE_MB);

    this.images = files;
    this.processedData = [];
    this.resultsTableBody.innerHTML = "";
    this.showPreview();
  }

  // Robust path extraction
  getCategoryFromPath(path) {
    if (!path) return "";
    const parts = path.replace(/\\/g, "/").split("/");
    // Permite rutas variadas, evita errores con imágenes subidas desde distintos sistemas
    if (parts.length >= 2) {
      const slug = parts[parts.length - 2];
      if (/^[\w-]+$/.test(slug)) return slug.toLowerCase();
    }
    return "";
  }

  async processWithVision(apiKey) {
    this.showProgress();
    for (let i = 0; i < this.images.length; i++) {
      const file = this.images[i];
      this.updateProgress(((i + 1) / this.images.length) * 100, `Procesando ${file.name}`);

      let meta = await this.extractMetadata(file);
      const vision = await this.analyzeVision(file, apiKey);

      // Si ha habido error visible
      if (vision.error) {
        alert(`Error procesando ${file.name}: ${vision.error}`);
        this.updateItemStatus(i, "error");
        continue;
      }

      const { labels, description } = vision;
      meta.description = description ? description.substring(0, 100) : "";
      let tags = [];
      if (labels && labels.length) {
        tags = labels.filter((l) => l.score && l.score > 0.6).map((l) => l.description.toLowerCase());
      }
      meta.category_slug = this.getCategoryFromPath(meta.path);
      meta.tags = tags.length ? `"${tags.join(", ")}"` : "";
      this.processedData.push(meta);
      this.appendRow(meta);
      this.updateItemStatus(i, "completed");
      await new Promise((r) => setTimeout(r, 200));
    }
    this.updateProgress(100, "Procesamiento completado");
    this.showResults();
    setTimeout(() => this.hideProgress(), 800);
  }

  // detecta errores de la API o retorna mensaje visible
  async analyzeVision(file, apiKey) {
    try {
      const base64 = await this.imageToBase64(file);
      const body = {
        requests: [
          {
            image: { content: base64 },
            features: [
              { type: "LABEL_DETECTION", maxResults: 20 },
              { type: "WEB_DETECTION", maxResults: 1 },
            ],
          },
        ],
      };
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const respJson = await response.json();
      if (!response.ok || respJson.error) {
        let errorMsg = respJson.error?.message || response.statusText || "Desconocido";
        return { labels: [], description: "", error: `API: ${errorMsg}` };
      }
      const labels = respJson.responses?.[0]?.labelAnnotations || [];
      const description = respJson.responses?.[0]?.webDetection?.bestGuessLabels?.[0]?.label || "";
      return { labels, description };
    } catch (e) {
      console.error("Error al llamar a Vision API:", e);
      return { labels: [], description: "", error: e.message || String(e) };
    }
  }

  imageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = () => {
        alert(`Error leyendo el archivo: ${file.name}`);
        reject(new Error("Lectura fallida"));
      };
      reader.readAsDataURL(file);
    });
  }

  // ... resto del código igual (extractMetadata, appendRow, updateItemStatus, showPreview, showResults, showProgress, hideProgress, updateProgress, downloadCSV, clearAll) ...
}

// Activar al cargar el DOM si existen todos los elementos
window.addEventListener("DOMContentLoaded", () => new ImageProcessor());
