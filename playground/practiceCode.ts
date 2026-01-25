export interface Person {
  name: String;
  age: number;
}

export interface Student extends Person {
  semester: number;
}

/**
 * @param {Person} person
 */
function printPerson(person: Person) {
  console.log(person.name);
  console.log(person.age);
}

function printStudentData(person: Student) {
  console.log(`Student Name is : ${person.name}`);
  console.log(`Student Name is :${person.age}`);
  console.log(`Student Semester is :${person.semester}`);
}

const personData: Person = {
  name: "Falana Dhimkana",
  age: 20,
};

printPerson(personData);

// Inheritance

const StudentData: Student = {
  name: "Ashwani Singh",
  age: 20,
  semester: 5,
};

printStudentData(StudentData);
