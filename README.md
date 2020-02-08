# ChaTa
*Charts and tables annotation platform*

# Description

The ChaTa platform is envisioned to be a tool to aid research in the fields of automatic chart recognition, classification, data extraction and similar applications. It is designed in such a way that it can be used for a wide range of research projects and may be easily extended if the need arises. Currently it consists of several modules (described in detail in sections below) that facilitate data collection, conducting experiments, automatic document annotation and more.

# Architecture

## Overview

The ChaTa platform consists of several modules hosted on virtual servers provided by our faculty, as presented on the diagram below.

![Modules diagram](/docs/img/modules.png)

## Modules

### Gathering

The main module, enabling communication between all other parts of the system. The gathering module consists of a scraper, document store, database and the central backend. This module's code can be found in the `gathering` directory.

The **scraper** is responsible for crawling web pages from the World Health Organization and Arxiv containing documents, downloading them and ingesting them into the database. When the gathering module is started by the system operator, it looks for new publications and adds them to the database. These publications are later downloaded asynchronously in the background. The downloaded files are in the PDF format, which makes it necessary to divide them into pages, while converting them to the PNG format.

Documents are stored in the **document store** on a hard drive and served through a web server to other modules. The document store is exposed through an nginx web server.

The **database** stores all metadata about publications, pages, OCR data, annotations made by users, experiments and all other data used by various parts of the system.

The **central backend** serves as an interface between the database and other modules. It exposes all its functionality through a web API. This part is also responsible for user authentication and authorization. Included in the central backend is the administration module that lets the system operator modify system’s configuration and manage users.

### Extraction model

The extraction model is trained on annotated documents and performs automatic charts and tables recognition on unannotated documents. This module's code can be found in the `extract` directory.

The data used to train the model is taken from the database, which contains annotations created by annotators. This module can automatically find annotations in a scanned document and store its results in the database with the auto-annotated status.

### Annotations

The annotations application consists of the backend (in the `annotations_be` directory) communicating with the central API and the frontend (in the `frontend` directory). Its main purpose is to gather handmade annotations from users. It allows users to add new annotations to unannotated documents, manage, read and edit them. There is also the option to filter annotations by: data of publication, status (new, auto-annotated, annotated) and other parameters. Data gathered using this module is then used in the extraction model for training purposes. 

### Compare

The compare application also has a backend communicating with the central API and a frontend. This module's code can be found in the `compare` directory.

Its goal is to compare annotation quality using human testers. Through this module users are able to add experiments that will allow them to assess the charts based on some criterium. The criterium can be for instance readability, aesthetics, or the amount of information. Later the data can be used to train models, so that they can perform automatic assessment. 

## Servers

Currently the system is spread over three virtual servers hosted on the MiNI cluster. They communicate with each other over the local network.

- **Gathering** – main server hosting the database, file store, central backend and the scraper. Services are hosted on the server using Docker.
- **Compare** – server hosting the compare application.
- **Annotation** – server hosting the annotation application. Services are provided through the Nginx web server and the Java Virtual Machine.

**Information on how to access each of the servers is not public.** If you are working on this system's deployment on the MiNI cluster, please contact your supervisor for more information.