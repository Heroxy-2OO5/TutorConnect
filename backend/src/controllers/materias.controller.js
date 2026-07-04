//Exportamos los servicios
const serviceMaterias = require('../services/materias.service');

//Funcion del end-point para devolver todas las materias
exports.getAll = async(req, res) => {
    try {
        const data = await serviceMaterias.getAllMaterias();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMaterias = async(req, res) => {
    try {
        const data = await serviceMaterias.CreateMaterias(req.body);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

exports.updateMateria = async(req, res) => {
    try {
        const { id } = req.params;
        await serviceMaterias.UpdateMateria(id, req.body);
        res.status(200).json({ message: 'Materia actualizada correctamente' });
    } catch (err) {
        console.error('[Materias] update error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMateria = async(req, res) => {
    try {
        const { id } = req.params;
        await serviceMaterias.DeleteMateria(id);
        res.status(200).json({ message: 'Materia eliminada correctamente' });
    } catch (err) {
        console.error('[Materias] delete error:', err);
        res.status(500).json({ error: err.message });
    }
};