Aiming to provide an interactive online Linux VM


![image](https://user-images.githubusercontent.com/7843281/225645362-bb02dd20-8ae4-4c71-be1b-739c0dc8d82f.png)
![image](https://user-images.githubusercontent.com/7843281/225645451-14a4976d-aa3b-4c69-9138-a55b2387087d.png)


## Introduction

This project uses [v86](https://github.com/copy/v86) to run a debian os in the browser, providing a monaco editor to edit files in linux vm more conveniently (of course you can also use vim/nano in Linux to edit files directly).

The sidebar on the left will show you the files in the `/mnt` directory. You can use touch to create files and mkdir to create directories in the terminal at the bottom, and the file tree on the left will automatically synchronize with the changes in response.

You can use `Ctrl-s` save file change to disk.

The system has `gcc/python` built in, so you can create a `.c/.py` file and run them.

## Plan

Over the next few weeks I will be working on the following in order

- Implement a basic web proxy that allows some common services to be requested in vm (such as package management services like npm registry/pypi, or some API mock services)
- Handle the issue of gcc compiled output can not running directly under `/mnt`
- Provide a progress bar for os image loading
- Re-structure the code (the current code implementation is confusing, scalability and maintainability are very poor)

## Known issues

- The default image size is 230M and may take several minutes to load for the first time.
- gcc compilation results can not work under /mnt (run the .out file will cause system crashes), you need to mv the .out file to /tmp for execution
- df does not currently work, fs does not currently implement stats correctly (this type of operation also causes system crashes)
- network current not work (Even though this part is complete, it only provides a proxy for requests from servers that support cors under the http protocol)

## About OS image

If you want to add other packages, you can modify [the script here](https://github.com/muzea-ci/v86-images/blob/master/scripts/docker/debian.filer.Dockerfile) to build your own OS image, then upload the image to the server and add the parameter `?disableState=true&hdd=<image url>` when accessing server-box web page to boot the system with the new image.

## Inspired by

- https://github.com/humphd/browser-shell
- https://github.com/giulioz/v86-module
- https://github.com/conwnet/github1s
