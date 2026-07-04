//Exportar el modelo
const modelMaterias = require('../models/materias.models')

//Creamos funcion de servicio para listar
exports.getAllMaterias = async() => {
    return await modelMaterias.findAll();
};

exports.CreateMaterias = async(data) => {
    const { codigo, nombre, semestre, descripcion } = data;
    return await modelMaterias.Insert(codigo, nombre, semestre, descripcion);
};

exports.UpdateMateria = async(id, data) => {
    const { codigo, nombre, semestre, descripcion } = data;
    return await modelMaterias.Update(
        Number(id),
        codigo,
        nombre,
        semestre,
        descripcion
    );
};

exports.DeleteMateria = async(id) => {
    return await modelMaterias.Delete(Number(id));
};