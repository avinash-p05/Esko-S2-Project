<%--
  Created by IntelliJ IDEA.
  User: Asus
  Date: 09-04-2025
  Time: 23:18
  To change this template use File | Settings | File Templates.
--%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- CSS includes will be added by the including page -->
    <c:if test="${not empty mainCss}">
        <link rel="stylesheet" href="/${mainCss}" />
    </c:if>
    <c:if test="${empty mainCss}">
        <!-- Fallback to scan for CSS file -->
        <c:set var="cssFiles" value="${pageContext.servletContext.getResourcePaths('/assets/')}" />
        <c:forEach items="${cssFiles}" var="cssFile">
            <c:if test="${cssFile.endsWith('.css')}">
                <link rel="stylesheet" href="/${cssFile}" />
            </c:if>
        </c:forEach>
    </c:if>

</head>
<body>
<jsp:doBody/>

<!-- JS includes will be added by the including page -->
<c:if test="${not empty mainJs}">
    <script type="module" src="/${mainJs}"></script>
</c:if>
<c:if test="${empty mainJs}">
    <!-- Fallback to scan for JS file -->
    <c:set var="jsFiles" value="${pageContext.servletContext.getResourcePaths('/assets/')}" />
    <c:forEach items="${jsFiles}" var="jsFile">
        <c:if test="${jsFile.endsWith('.js')}">
            <script type="module" src="/${jsFile}"></script>
        </c:if>
    </c:forEach>
</c:if>
</body>
</html>