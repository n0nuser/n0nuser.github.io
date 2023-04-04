---
title: "Python Engineer at Axpe Consulting S.L."
description: "Python engineer with experience developing backend solutions for API-first systems using FastAPI, SQLAlchemy, and OAuth. I'm also skilled in entity-relationship diagram design, data migration, and Python script optimization. I'm familiar with tools like Docker, Git, and MS Teams for version control, virtual environment management, and Agile methodology."
date: 2022-12-15
lastmod: 2023-03-21
author: "Pablo Jesús González Rubio"
cover: "cover.jpg"
coverAlt: "Axpe Consulting S.L."
draft: false
tags: [ "Professional Experience", "Python", "FastAPI", "SQLAlchemy", "OAuth" ]
---

Here is listed a comprehensive list of the projects that I have contributed to during my tenure at Axpe Consulting S.L. and with its clients.

## Axpe Consulting S.L. (12.2022 - Present)

### Reservation Manager

As the backend developer for an API-first reservation management system that handles workstations in multiple offices, I was responsible for designing the entity-relationship diagram and implementing it using [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/). Additionally, I implemented a FastAPI archetype that allows for multiple microservices, each matching its [OpenAPI specification](https://www.openapis.org/). For virtual environment and package management, I utilized Poetry. For version history management, I used Git with Github, and for the SCRUM Methodology, I utilized MS Teams.

The reservation management system is built on top of [FastAPI](https://fastapi.tiangolo.com/), ensuring seamless integration with the OpenAPI schema. I utilized SQLAlchemy 2.0 with [PostgreSQL](https://www.postgresql.org/) and [Alembic](https://alembic.sqlalchemy.org/en/latest/) for efficient database management, and [OAuth](https://oauth.net/) with [Keycloak](https://www.keycloak.org/) for security. The system is deployed using a [Dockerfile](https://www.docker.com/), ensuring ease of use and accessibility.

As something to highlight, I implemented generic functions for CRUD operations and Pagination with SQLAlchemy 2.0 to adapt the best to the endpoints I generated from the OpenAPI specification. I also implemented a generic method for the creation of tests for the CRUD operations with different HTTP errors, which allowed me to reduce the amount of code and improve the readability and maintainability of the code.

### Insomnia Config Generator

I refactored and optimized an existing Python script that generates an [Insomnia](https://insomnia.rest/) configuration file from a YAML template and a properties file. The updated script with OOP paradigm is now faster, more readable, and easier to maintain.

## Quant AI Lab. (12.2022 - Present)

### CV Analyzer

As a Full-Stack Developer, I played a pivotal role in developing an innovative system that extracted and stored information from curriculums. The system was built using Python for the backend and Streamlit for the frontend, with MongoDB as database. My responsibilities included refactoring the backend code to enhance readability and maintainability, ensuring the seamless functioning of the Streamlit application, and resolving any issues that arose for the client.

I led the redevelopment of the existing application by implementing a new backend using FastAPI and a new frontend using Next.JS, which resulted in significant improvements in performance and user experience. I also oversaw the migration of a legacy Access database into the existing MongoDB database. This involved analyzing the database structure and data, exporting the data from Access to CSV files, transforming the legacy data into a new format agreed upon with the client, adapting the existing code to work with the new data format, and inserting the data into the database.

Throughout this project, I was responsible for ensuring that the transition to the new system was seamless and that the client's DevOps team could import the data into MongoDB using BSON files. Overall, my contributions helped streamline the client's workflow and improve the efficiency of their information management processes.

### QuarterBack

As a Full-Stack Developer at QuarterBack, I was instrumental in refactoring an AI library that included NLP functionality and restructuring it using the best Python practices available at that version.

By restructuring the files and the code into classes, I was able to significantly enhance the readability and maintainability of the code, which helped streamline the development process and reduce the likelihood of errors.

Additionally, I led the redevelopment of a existing application using these functionalities from the library, by implementing a new backend using FastAPI with OpenAPI first in mind, and a new frontend using Next.JS and Tailwind CSS with Flowbite.
