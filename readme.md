# CineBase

CineBase is a web-app which lists movies with details such as actors, producer, year of release along with an image depicting the movie. It also allows adding new movies along with creating new actors and producers. It also allows editing the existing movies.

## Getting Started

### Prerequisites

Make sure that you have Node.js installed your system. If you have not already installed, refer the links -

* For Windows Users - https://tinyurl.com/y4k9xj4y

* For Non-Windows Users - https://tinyurl.com/y35fknnw

Finally, check the version of Node.js with (I've used v8.11.3) - 
```
node -v
```

I've used PostgreSQL as my DBMS. You can go ahead and install PostgreSQL using the link - https://tinyurl.com/yyfhhlms or you can use any other relational DBMS.

### Setup and Installation

Once you have installed Node.js, 90% of the job is done. Open terminal/cmd and go to the desired location for project creation.
Clone this repository, go into the project folder and run the following command -

```
npm install
```

This will install all the modules listed as dependencies in the **package.json** file.

After that, fill in the appropriate database connection details in the **server.js** file - 

```
let config = {
  user: 'username',
  database: 'database_name',
  host: 'host_name',
  password: 'password'
};
```

To get the database ready, import the SQL script present in this repository (CineBase.sql)

## Running the Server

Now that we have completed the setup, it's time to get the server running. Use the following command to start the server - 

```
node server.js
```

Once the server starts, it will log the following in console - 

```
App listening on port 9090!
```

**Note**: Since we set port number to 9090, our application runs at port 9090.

**Tip**: Use the following command which automatically restarts the server upon any changes in the **server.js** file.

```
nodemon server.js
```

```
[nodemon] 1.18.9
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: *.*
[nodemon] starting `node server.js`
App listening on port 9090!
```

## Additional Details

* **Schema**: Check out the database schema by viewing the image - **schema.png** with 5 tables and a single view. The schema has been normalized and is in 3NF.

* **Validation**: Validation has been added on the following fields - 
    1. **Actor(s)**: Check if at least one actor has been added/selected.
    2. **Producer**: Check if exactly one producer has been added/selected.
    3. **Year of Release**: Check if the year entered is a valid year.
    4. **Common Validation**: Check if a required field is not empty.

```
// actor(s) validation

let f1 = 1;
let actor_checks = document.getElementsByName("actor_type");
if (actor_checks[0].checked || actor_checks[1].checked) {
  if (actor_checks[0].checked) {
    if ($("#actor_list").val().length === 0) {
      f1 = 0;
    }
  } else {
    let count = 0;
    $.each(actor.details, function (key, value) {
      if (key !== "ids")
        count++;
    });
    if (count < 1)
      f1 = 0;
  }
} else {
  f1 = 0;
}
```

```
// producer validation (similar to actor validation)

let f2 = 1;
let producer_checks = document.getElementsByName("producer_type");
if (producer_checks[0].checked || producer_checks[1].checked) {
  if (producer_checks[1].checked) {
    if (!(producer.hasOwnProperty("name") && producer.hasOwnProperty("dob") && producer.hasOwnProperty("sex") && producer.hasOwnProperty("bio")))
      f2 = 0;
  }
} else {
  f2 = 0;
}
```

```
// year of release validation

let f3 = 1;
let year = $("#m_yor").val();
f3 = check_number(year, 4);

function check_number(number, len) {
  if (number.length === len) {
    for (var i = 0; i < len; i++) {
      if (("0123456789").indexOf(number[i]) === -1) {
        return 0;
      }
    }
  } else
    return 0;
  return 1;
}
```

## Built With

* [Node.js](https://nodejs.org/en/docs/) - Server-side scripting language used
* [PostgreSQL](https://www.postgresql.org/docs/) - RDBMS used

### Other library/frameworks/plugins used

* [jQuery](https://api.jquery.com/) - Javascript made easy
* [Bootstrap 3](https://api.jquery.com/) - powerful front-end framework
* [iziToast](http://izitoast.marcelodolza.com/) - Elegant, responsive notification plugin used 
* [bootstrap-datetimepicker](https://eonasdan.github.io/bootstrap-datetimepicker/) - used for hassle free date-time management
* [bootstrap-multiselect](http://davidstutz.de/bootstrap-multiselect/#configuration-options) - used for handling input with multi-select options with ease

## Authors

* **Venkatesh Naidu** - [Venky-GH](https://github.com/Venky-GH)
