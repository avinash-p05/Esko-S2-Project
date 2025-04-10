<%@ tag language="java" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%-- Tag attributes --%>
<%@ attribute name="title" required="true" %>
<%@ attribute name="mainCss" required="false" %>
<%@ attribute name="mainJs" required="false" %>
<%@ attribute name="additionalHead" fragment="true" %>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>eskos2 Project - ${title}</title>

    <!-- Include main CSS file if provided -->
    <c:if test="${not empty mainCss}">
        <link rel="stylesheet" href="${mainCss}">
    </c:if>

    <!-- Allow for additional head content -->
    <jsp:invoke fragment="additionalHead"/>
</head>
<body>
<header>
    <h1>eskos2 Project</h1>
    <p>Spring Boot with React Vite Integration</p>
</header>

<!-- Main content placeholder -->
<main>
    <jsp:doBody/>
</main>

<!-- Footer section -->
<footer>
    <p>Current build information:</p>
    <ul>
        <li>Build timestamp: <%= new java.util.Date() %></li>
    </ul>
</footer>

<!-- Include main JS file if provided -->
<c:if test="${not empty mainJs}">
    <script src="${mainJs}" type="module"></script>
</c:if>
</body>
</html>