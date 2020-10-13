import express from "express";
import winston from "winston";
import gradesRouter from "./routes/grades.js";
import totalGradeRouter from "./routes/totalGrade.js";
import { promises as fs } from "fs";
import cors from "cors";
//import swaggerUi from "swagger-ui-express";
//import { swaggerDocument } from "./doc.js";

const { readFile, writeFile} = fs;

global.fileName = "grades.json";

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} [${label}] ${level}: ${message}`;
});
global.logger = winston.createLogger({
	level: "silly",
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({ filename: "my-grades-control-api.log" })
	],
	format: combine(
		label({ label: "my_grades_control_api"}),
		timestamp(),
		myFormat
	)
})

const app = express();
app.use(express.json());
app.use(cors());
//app.use(express.static("public"));
//app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/grade", gradesRouter);
app.use("/calculation", totalGradeRouter);

app.listen(3000, async () => {
	try {
		await readFile(global.fileName);
		global.logger.info("Servidor rodando perfeitamente!");
	} catch (err) {
		const initialJson = {
			nextId: 1,
			grades: []
		}
		writeFile(global.fileName, JSON.stringify(initialJson)).then(() => {
				global.logger.info("Servidor rodando perfeitamente e arquivo criado!");
			}).catch(err => {
				global.logger.error(err);
			});
	}
});
