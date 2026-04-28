const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./app/core/swagger");
const apiRoutes = require("./app/presentation/routes");

const app = express();
const port = 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Setup endpoint untuk Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Daftarkan routes aplikasi
app.use("/api", apiRoutes);

app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
  console.log(
    `📚 Dokumentasi Swagger tersedia di http://localhost:${port}/api-docs`,
  );
});
