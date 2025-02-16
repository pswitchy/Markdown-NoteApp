# Markdown Note-taking App

This is a simple Markdown Note-taking application built in Java with Spring Boot. It allows users to upload, save, render, and check the grammar of Markdown notes.

## Features

- **Save Notes:** Users can save notes as Markdown text, providing a title and optional tags.
- **Upload Markdown Files:**  Supports uploading notes directly as Markdown files.
- **List Notes:** Provides an endpoint to list all saved notes (titles and metadata).
- **Render Markdown to HTML:**  Renders the Markdown content of a note into HTML for display.
- **Grammar Check:** Integrates with the LanguageTool Plus API to check the grammar of notes.
- **Search:** Allows searching notes by title or content.
- **Tagging and Categorization:** Notes can be tagged for categorization.
- **User Authentication:** Basic user registration and login for note security.
- **Pagination:** Implemented pagination for listing notes, especially useful for a large number of notes.
- **Modern UI:**  Enhanced user interface using Tailwind CSS for a clean and responsive design, including animations and improved UX.
- **Markdown Editor:** Integrated SimpleMDE Markdown editor for a better writing experience.

## Technologies Used

- **Java:** Programming language for backend development.
- **Spring Boot:** Framework for building the RESTful API and application backend.
- **Spring Data JPA:** For database interaction and simplified data access.
- **H2 Database:** In-memory database for development and testing.
- **Spring Security:** For user authentication and authorization.
- **Spring Web:** For building RESTful web services.
- **Thymeleaf:** Template engine for server-side rendering of HTML.
- **CommonMark:** Library for parsing and rendering Markdown.
- **LanguageTool Plus API:** External API for grammar checking.
- **Tailwind CSS:** Utility-first CSS framework for modern UI styling.
- **SimpleMDE:** Markdown editor library for the frontend.
- **Maven:** Build automation and dependency management tool.
- **Lombok:** Java library to reduce boilerplate code (getters, setters, constructors, etc.).

## Prerequisites

Before running the application, ensure you have the following installed:

- **Java Development Kit (JDK) 17 or higher:**  Download from [Oracle](https://www.oracle.com/java/technologies/javase-downloads.html) or [OpenJDK](https://openjdk.java.net/projects/jdk/).
- **Maven:** Download and install from [Apache Maven](https://maven.apache.org/download.cgi).

## Setup and Run Instructions

1.  **Clone the repository:**

    ```bash
    git clone [repository_url]
    cd markdown-note-app
    ```

    *(Replace `[repository_url]` with the actual URL of your Git repository if you are using one).*

2.  **Download SimpleMDE Files:**

    You need to manually download `simplemde.min.css` and `simplemde.min.js` and place them in the `src/main/resources/static/` directory. You can download them from:

    -   [CDNJS](https://cdnjs.com/libraries/simplemde) or
    -   [SimpleMDE Website](https://simplemde.com/)

3.  **Build and Run the Application:**

    Navigate to the project directory in your terminal and run the following Maven command:

    ```bash
    mvn spring-boot:run
    ```

    This will compile the project, download dependencies, and start the Spring Boot application.

4.  **Access the Application:**

    Once the application has started, open your web browser and go to:

    ```
    http://localhost:8080/
    ```

    You will be redirected to the login page. You can register a new user or log in if you have already registered.

## API Usage Examples

After running the application, you can use the following endpoints:

**Register User:**

- **URL:** `http://localhost:8080/register` (GET - to view form, POST - to submit registration)
- **Method:** POST
- **Request Body (form data):**
    - `username`:  Desired username.
    - `password`: Desired password.

**Login:**

- **URL:** `http://localhost:8080/login` (GET - to view form, POST - to submit login)
- **Method:** POST
- **Request Body (form data):**
    - `username`: Your registered username.
    - `password`: Your password.

**Save Note (Text Content):**

- **URL:** `http://localhost:8080/notes/save-text`
- **Method:** POST
- **Request Body (form data):**
    - `title`: Title of the note.
    - `content`: Markdown text content of the note.
    - `tags` (optional): Comma-separated tags.

**Save Note (File Upload):**

- **URL:** `http://localhost:8080/notes/save-file`
- **Method:** POST
- **Request Body (multipart/form-data):**
    - `file`: Markdown file to upload.
    - `title`: Title of the note.
    - `tags` (optional): Comma-separated tags.

**List Notes:**

- **URL:** `http://localhost:8080/notes`
- **Method:** GET
- **Parameters (optional):**
    - `page`: Page number for pagination (default 0).
    - `size`: Number of notes per page (default 10).
    - `search`: Search term to filter notes by title or content.

**Get Note HTML (Rendered):**

- **URL:** `http://localhost:8080/notes/{id}/html`
- **Method:** GET
- **Path Parameter:**
    - `{id}`: ID of the note to render.

**Check Grammar:**

- **URL:** `http://localhost:8080/notes/{id}/grammar-check`
- **Method:** POST
- **Path Parameter:**
    - `{id}`: ID of the note to check grammar for.

**(Note: You will need to be logged in to access the `/notes/**` endpoints.)**

## Further Enhancements (Possible Future Features)

- Implement a more robust user management system with roles and permissions.
- Add features for editing and deleting notes.
- Implement tag management as separate entities with relationships for more advanced tagging.
- Enhance search functionality with full-text search capabilities.
- Consider using a more persistent database (like PostgreSQL or MySQL) for production deployments.
- Implement more sophisticated error handling and input validation.
- Further enhance the UI/UX with more advanced features and interactions using a frontend framework (React, Vue, Angular).

