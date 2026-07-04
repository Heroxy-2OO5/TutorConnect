// Exportamos la conexion a la base de datos
const db = require('../config/db');

//Creamos funciones para hacer lo que nesecitemos

//Funcion para listar todas las materias
exports.findAll = async() => {
    const result = await db.query('SELECT * FROM materias');
    return result.rows;
};

exports.Insert = async(codigo, nombre, semestre, descripcion) => {
    const result = await db.query('CALL sp_insertar_materia($1,$2,$3,$4);', [codigo, nombre, semestre, descripcion]);
}

exports.Update = async(id, codigo, nombre, semestre, descripcion) => {
    await db.query(
        'CALL sp_actualizar_materia($1,$2,$3,$4,$5);', [id, codigo, nombre, semestre, descripcion]
    );
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

exports.Delete = async(id) => {
    await db.query(
        'CALL sp_eliminar_materia($1);', [id]
    );
};