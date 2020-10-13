import express from "express";
import { promises as fs } from "fs";

const { readFile } = fs;

const router = express.Router();

router.get("/totalgrade", async (req, res, next) => {
	try {
		const student = req.query.student;
		const subject = req.query.subject;
		const data = JSON.parse(await readFile(global.fileName));
		let acumula = 0;
		data.grades.forEach(grade => {
			if (grade.student === student && grade.subject === subject)
				acumula = acumula + grade.value;
		});
		res.send("Nota total: " + acumula);
		global.logger.info("GET /nota/totalgrade");
	} catch (err) {
		next(err);
	}
});

router.get("/media", async (req,res,next) => {
	try {
		const subject = req.query.subject;
		const type = req.query.type;
		const data = JSON.parse(await readFile(global.fileName));
		let total = 0;
		let acumula = 0;
		data.grades.forEach(grade => {
			if (grade.subject === subject && grade.type === type)
			{
				acumula = acumula + grade.value;
				total++;
			}
		})
		let media = acumula / total;
		res.send("Média: " + media);
		global.logger.info("GET /nota/media")
	} catch (err) {
		next(err);
	}
});

router.get("/bestgrades", async (req,res,next) => {
	try {
		const subject = req.query.subject;
		const type = req.query.type;
		const data = JSON.parse(await readFile(global.fileName));
		let bests =[];
		data.grades.forEach(grade => {
			if (grade.subject === subject && grade.type === type)
				bests.push(grade);
		});
		let orderedBests = bests.sort( (a, b) => {
			return b.value - a.value;
		})
		//console.log(orderedBests);
		res.send(orderedBests.slice(0, 3));
		global.logger.info("GET /nota/bestgrades");
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
