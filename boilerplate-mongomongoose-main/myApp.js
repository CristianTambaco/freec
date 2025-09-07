require('dotenv').config();
const mongoose = require('mongoose');

// Conectar a MongoDB usando el URI de la base de datos desde las variables de entorno
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión exitosa a la base de datos'))
  .catch((err) => console.error('Error al conectar a la base de datos:', err));

// Definir el esquema de la persona
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // El campo name es obligatorio
  },
  age: {
    type: Number,
    required: false,  // El campo age es opcional
  },
  favoriteFoods: {
    type: [String],  // Un array de cadenas para los alimentos favoritos
    required: false, // El campo favoriteFoods es opcional
  }
});

// Crear el modelo basado en el esquema
const Person = mongoose.model('Person', personSchema);

// Función para crear y guardar una persona
const createAndSavePerson = (done) => {
  const person = new Person({
    name: 'Juan Pérez',
    age: 30,
    favoriteFoods: ['Pizza', 'Tacos'],
  });

  person.save((err, savedPerson) => {
    if (err) return done(err);  // Si hay un error, lo retornamos
    done(null, savedPerson);    // Si todo está bien, retornamos el documento guardado
  });
};

// Función para crear muchas personas a la vez usando Model.create()
const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople, (err, savedPeople) => {
    if (err) return done(err);  // Si hay un error, lo retornamos
    done(null, savedPeople);    // Si todo está bien, retornamos las personas guardadas
  });
};

// Ejemplo de arreglo de personas para insertar
const peopleArray = [
  { name: 'Carlos Pérez', age: 35, favoriteFoods: ['Pasta', 'Ensalada'] },
  { name: 'Ana Gómez', age: 28, favoriteFoods: ['Sushi', 'Pizza'] },
  { name: 'Luis Martínez', age: 40, favoriteFoods: ['Hamburguesa', 'Papitas'] }
];

// Llamar a la función createManyPeople para insertar múltiples personas
createManyPeople(peopleArray, (err, people) => {
  if (err) {
    console.error('Error creando las personas:', err);
  } else {
    console.log('Personas creadas con éxito:', people);
  }
});



// Función para encontrar personas por nombre usando Model.find()
const findPeopleByName = (personName, done) => {
  // Usamos el método `find` para buscar todas las personas con el nombre dado
  Person.find({ name: personName }, (err, foundPeople) => {
    if (err) return done(err);  // Si hay un error, lo retornamos
    done(null, foundPeople);    // Si todo está bien, retornamos el arreglo de personas encontradas
  });
};

// Función para encontrar una persona por su comida favorita usando Model.findOne()
const findOneByFood = (food, done) => {
  // Usamos el método `findOne` para encontrar la primera persona que tenga la comida en sus alimentos favoritos
  Person.findOne({ favoriteFoods: food }, (err, person) => {
    if (err) return done(err);  // Si hay un error, lo retornamos
    done(null, person);         // Si todo está bien, retornamos el documento de la persona
  });
};

// Función para encontrar una persona por su _id usando Model.findById()
const findPersonById = (personId, done) => {
  // Usamos el método `findById` para buscar la persona por su _id
  Person.findById(personId, (err, person) => {
    if (err) return done(err);  // Si hay un error, lo retornamos
    done(null, person);         // Si todo está bien, retornamos el documento de la persona
  });
};

// Función para editar una persona y luego guardar los cambios
const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";

  // Buscamos a la persona por su _id
  Person.findById(personId, (err, person) => {
    if (err) return done(err);  // Si hay un error, lo retornamos

    // Agregamos "hamburger" a la lista de alimentos favoritos
    person.favoriteFoods.push(foodToAdd);

    // Si favoriteFoods es un campo de tipo [String], no es necesario usar markModified
    // Solo guardamos el documento actualizado
    person.save((err, updatedPerson) => {
      if (err) return done(err);  // Si hay un error al guardar, lo retornamos
      done(null, updatedPerson);  // Si todo está bien, retornamos el documento actualizado
    });
  });
};

// Función para encontrar una persona y actualizar su edad
// Función para encontrar una persona por su nombre y actualizar su edad a 20
const findAndUpdate = (personName, done) => {
  const ageToSet = 20;

  // Usamos findOneAndUpdate para encontrar y actualizar el documento
  Person.findOneAndUpdate(
    { name: personName },       // Criterio de búsqueda por nombre
    { age: ageToSet },          // Lo que vamos a actualizar (edad)
    { new: true },              // Devuelve el documento actualizado
    (err, updatedPerson) => {
      if (err) return done(err);  // Si hay un error, lo retornamos
      done(null, updatedPerson);  // Si todo está bien, retornamos el documento actualizado
    }
  );
};


// Función para eliminar una persona por id

const removeById = (personId, done) => {
  Person.findByIdAndRemove(personId, (err, removedPerson) => {
    if (err) return done(err);  // Si hay un error, lo retornamos
    done(null, removedPerson);  // Si todo está bien, retornamos el documento eliminado
  });
};



// Función para eliminar muchas personas por nombre
const removeManyPeople = (done) => {
  const nameToRemove = "Mary";  // Nombre a buscar y eliminar

  // Eliminar todas las personas con el nombre 'Mary'
  Person.remove({ name: nameToRemove }, (err, result) => {
    if (err) return done(err);  // Si hay un error, lo retornamos
    done(null, result);         // Retornamos el objeto de resultado
  });
};


// Función para realizar una cadena de consultas
const queryChain = (done) => {
  const foodToSearch = "burrito";  // El alimento que estamos buscando en las personas

  // Creación de la consulta encadenada
  Person.find({ favoriteFoods: foodToSearch })  // Buscar personas que tengan "burrito" en sus alimentos favoritos
    .sort({ name: 1 })  // Ordenar los resultados por nombre (ascendente)
    .limit(2)  // Limitar los resultados a solo 2 personas
    .select('-age')  // Excluir el campo 'age' en los resultados
    .exec((err, people) => {  // Ejecutar la consulta
      if (err) {
        console.error('Error en la consulta:', err);  // Si hay un error, lo mostramos
        return done(err);  // Pasamos el error al callback
      }
      if (people.length === 0) {
        console.log('No se encontraron personas con ese alimento favorito');
      } else {
        console.log('Personas encontradas:', people);  // Mostrar los resultados encontrados
      }
      done(null, people);  // Si la consulta es exitosa, pasamos los resultados al callback
    });
};




// Crear una persona y mostrar el resultado
createAndSavePerson((err, person) => {
  if (err) {
    console.error('Error creando la persona:', err);
  } else {
    console.log('Persona creada con éxito:', person);
  }
});

/** **Well Done !!**
/* ¡¡Has completado estos desafíos, vamos a celebrarlo!
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------
exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
