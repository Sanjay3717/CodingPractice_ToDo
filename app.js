const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
var format = require("date-fns/format");
const addDays = require("date-fns/addDays");
var isValid = require("date-fns/isValid");
let db = null;
module.exports = app;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const checkRequestsQueries = async (request, response, next) => {
  const { search_q, category, priority, status, date } = request.query;
  const { todoId } = request.params;
  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const categoryIsInArray = categoryArray.includes(category);
    if (categoryIsInArray === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const priorityIsInArray = priorityArray.includes(priority);
    if (priorityIsInArray === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const statusIsInArray = statusArray.includes(status);
    if (statusIsInArray === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (date !== undefined) {
    try {
      const myDate = new Date(date);

      const formatedDate = format(new Date(date), "yyyy-MM-dd");
      console.log(formatedDate, "f");
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`
        )
      );
      console.log(result, "r");
      console.log(new Date(), "new");

      const isValidDate = await isValid(result);
      console.log(isValidDate, "V");
      if (isValidDate === true) {
        request.date = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }

  request.todoId = todoId;
  request.search_q = search_q;

  next();
};

const checkRequestsBody = (request, response, next) => {
  const { id, todo, category, priority, status, dueDate } = request.body;
  const { todoId } = request.params;

  if (category !== undefined) {
    categoryArray = ["WORK", "HOME", "LEARNING"];
    categoryIsInArray = categoryArray.includes(category);

    if (categoryIsInArray === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    priorityArray = ["HIGH", "MEDIUM", "LOW"];
    priorityIsInArray = priorityArray.includes(priority);
    if (priorityIsInArray === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    statusIsInArray = statusArray.includes(status);
    if (statusIsInArray === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (dueDate !== undefined) {
    try {
      const myDate = new Date(dueDate);
      const formatedDate = format(new Date(dueDate), "yyyy-MM-dd");
      console.log(formatedDate);
      const result = toDate(new Date(formatedDate));
      const isValidDate = isValid(result);
      console.log(isValidDate);
      console.log(isValidDate);
      if (isValidDate === true) {
        request.dueDate = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }
  request.todo = todo;
  request.id = id;

  request.todoId = todoId;

  next();
};

/*app.get("/todos/", async (request, response) => {
  const { status } = request.query;
  const getAllTodos = `select * from todo`;
  const getArray = await db.all(getAllTodos);
  response.send(getArray);
}); */

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasDueDateProperty = (requestQuery) => {
  return requestQuery.DueDate !== undefined;
};

app.get("/todos/", checkRequestsQueries, async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  const statusAll = ["TO DO", "DONE", "IN PROGRESS"];
  const inStatusAllArray = statusAll.includes(status);

  const priorityAll = ["HIGH", "MEDIUM", "LOW"];
  const inPriorityAllArray = priorityAll.includes(priority);

  const categoryAll = ["WORK", "HOME", "LEARNING"];
  const inCategoryAllArray = categoryAll.includes(category);

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      console.log(inPriorityAllArray);
      console.log(inStatusAllArray);

      getTodosQuery = `
            SELECT
                *
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND status = '${status}'
                AND priority = '${priority}';`;

      break;

    case hasCategoryAndStatusProperties(request.query):
      console.log(inCategoryAllArray);
      console.log(inStatusAllArray);
      getTodosQuery = `
            SELECT
                *
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND status = '${status}'
                AND category = '${category}';`;
      break;

    case hasCategoryAndPriorityProperties(request.query):
      console.log(inCategoryAllArray);
      console.log(inPriorityAllArray);
      getTodosQuery = `
            SELECT
                *
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND priority = '${priority}'
                AND category = '${category}';`;
      break;

    case hasSearchProperty(request.query):
      getTodosQuery = `SELECT
                *
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%';`;
      break;

    case hasStatusProperty(request.query):
      //const statusAll = ["TO DO", "DONE", "IN PROGRESS"];
      //const inStatusAllArray = statusAll.includes(status);
      console.log(inStatusAllArray);

      if (inStatusAllArray === true) {
        getTodosQuery = `
            SELECT
                *
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND status = '${status}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;

    case hasPriorityProperty(request.query):
      console.log(inPriorityAllArray);
      if (inPriorityAllArray === true) {
        getTodosQuery = `SELECT
                *
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND priority = '${priority}'; `;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;
    case hasCategoryProperty(request.query):
      console.log(inCategoryAllArray);
      if (inCategoryAllArray === true) {
        getTodosQuery = `SELECT
                *
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND category = '${category}'; `;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
  }
  data = await db.all(getTodosQuery);
  response.send(
    data.map((eachItem) => convertDbObjectToResponseObject(eachItem))
  );
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getItemQuery = `select * from todo where id = ${todoId};`;
  const getItem = await db.get(getItemQuery);
  response.send(convertDbObjectToResponseObject(getItem));
});

/*const getFormatedDate = () => {
  const newDate = format(new Date(1999, 4, 25), "yyyy-MM-dd");
  console.log(
    `${newDate.getFullYear()} - ${newDate.getMonth()} - ${newDate.getDate()}`
  );
}; */
//API 3

app.get("/agenda/", async (request, response) => {
  //const formatedDate = format(new Date(1999, 4, 25), "yyyy-MM-dd");
  //console.log(formatedDate);
  //console.log(isValid(formatedDate));
  /* const actualDate = `${formatedDate.getFullYear()}-${
    formatedDate.getMonth() - 1
  }-${formatedDate.getDate()}`; */
  //console.log(actualDate);
  /*const { dueDate } = request.query;
  console.log({ dueDate });
  const getDateQuery = `select * from todo where due_date = '${dueDate}';`;
  const getDate = await db.get(getDateQuery);
  response.send(convertDbObjectToResponseObject(getDate)); */
  getDateQuery = "";
  const { dueDate } = request.query;
  console.log(dueDate);
  switch (true) {
    case hasDueDateProperty(request.query):
      getDateQuery = `
            SELECT
                *
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND due_date = ${dueDate};`;
      break;
  }
  const getDate = await db.get(getDateQuery);
  response.send(convertDbObjectToResponseObject(getDate));
});

//API 4

app.post("/todos/", checkRequestsBody, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const addItem = `INSERT INTO 
            todo (id, todo, priority, status, category, due_date)
        VALUES
            (
                ${id},
               '${todo}',
               '${priority}',
               '${status}',
               '${category}',
               '${dueDate}'
            )
        ;`;

  const dbResponse = await db.run(addItem);
  //const id = dbResponse.lastID;
  response.send("Todo Successfully Added");
});

//API 5

app.put("/todos/:todoId/", checkRequestsBody, async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category";
      break;
    case requestBody.due_date !== undefined:
      updateColumn = "Due Date";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category = '${category}',
      due_date = '${dueDate}'
    WHERE
      id = ${todoId};`;

  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const deleteItem = `delete from todo where id = ${todoId};`;
  await db.run(deleteItem);
  response.send("Todo Deleted");
});

app.listen(3000, () => {
  console.log("Server is running");
});
