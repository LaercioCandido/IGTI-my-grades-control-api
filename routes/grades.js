import express from "express";
import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

const router = express.Router();

router.post("/", async (req, res, next) => {
	try {
		let grade = req.body;

		if (!grade.student || !grade.subject || !grade.type || grade.value == null) {
			throw new Error("Student, subject, type e value são obrigatórios!");
		}

		const data = JSON.parse(await readFile(global.fileName));

		grade = {
			id: data.nextId,
			student: grade.student,
			subject: grade.subject,
			type: grade.type,
			value: grade.value,
			timestamp: new Date()
		};
		data.nextId++;
		data.grades.push(grade);

		await writeFile(global.fileName, JSON.stringify(data, null, 2));
		res.send(grade);
		global.logger.info(`POST /grade - ${JSON.stringify(grade)}`);
	} catch (err) {
		next(err);
	}
});

router.get("/", async (req, res, next) => {
	try {
		const data = JSON.parse(await readFile(global.fileName));
		//console.log(data);
		delete data.nextId;
		res.send(data);
		global.logger.info("GET /grade");
	} catch (err) {
		next(err);
	}
});

router.get("/:id", async (req, res, next) => {
	try {
		const data = JSON.parse(await readFile(global.fileName));
		const grade = data.grades.find(grade => grade.id === parseInt(req.params.id));
		res.send(grade);
		global.logger.info("GET /grade/:id")
	} catch (err) {
		next(err);
	}
});

router.delete("/:id", async (req, res, next) => {
	try {
		const data = JSON.parse(await readFile(global.fileName));
		data.grades = data.grades.filter(grade => grade.id !== parseInt(req.params.id));
		await writeFile(global.fileName, JSON.stringify(data, null, 2));
		res.end();
		global.logger.info(`DELETE /grade/:id - ${req.params.id}`);
	} catch (err) {
		next(err);
	}
});

router.put("/", async (req, res, next) => {
	try {
		const grade = req.body;

		//validação dos campos
		if (!grade.id || !grade.student || !grade.subject || !grade.type || grade.value == null) {
			throw new Error("Id, student, subject, type e value são obrigatórios!");
		}

		const data = JSON.parse(await readFile(global.fileName));
		const index = data.grades.findIndex(grd => grd.id === parseInt(grade.id));

		//quando o índice passado no body não existe, index retorna -1
		//logo, precisa tratar esse erro
		if (index === -1) {
			throw new Error("Registro não encontrado!");
		}

		data.grades[index].student = grade.student;
		data.grades[index].subject = grade.subject;
		data.grades[index].type = grade.type;
		data.grades[index].value = grade.value;

		await writeFile(global.fileName, JSON.stringify(data, null, 2));
		res.send(grade);
		global.logger.info(`PUT /grade - ${JSON.stringify(grade)}`);

	} catch (err) {
		next(err);
	}
});

//Tratamento de erros
router.use((err, req, res, next) => {
	global.logger.error(`${req.method} ${req.baseUrl} - ${err.message}`)
	res.status(400).send({ error: err.message });
})


export default router;
