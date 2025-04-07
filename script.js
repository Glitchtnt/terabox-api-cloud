const TreeView = (function () {
    function render(data, rootList) {
        for (const item of data) {
            if (item.isDir) {
                // create <li class="folder">
                const li = document.createElement("li")
                li.className = "folder"
                li.setAttribute("opened", "true")

                // create <div class="folder-header">
                const folderHeaderDiv = document.createElement("div")
                folderHeaderDiv.className = "folder-header"
                folderHeaderDiv.innerHTML = `<span class="icon-arrow">
                                                <i class="fa-solid fa-caret-right hidden"></i>
                                                <i class="fa-solid fa-caret-down"></i>
                                            </span>
                                            <span class="icon-folder">
                                                <i class="fa-solid fa-folder hidden"></i>
                                                <i class="fa-solid fa-folder-open"></i>
                                            </span>
                                            <span class="folder-name">${item.name}</span>`

                // append <ul class="children"> to <li class="folder">
                li.appendChild(folderHeaderDiv)

                // If the folder has children, recursively render them
                if (item.children && item.children.length > 0) {
                    // create <ul class="children">
                    const childrenUl = document.createElement("ul")
                    childrenUl.className = "children"
                    // recursively render
                    render(item.children, childrenUl)
                    // append <ul class="children"> to <li class="folder">
                    li.appendChild(childrenUl)
                }

                // append to rootList
                rootList.appendChild(li)
            } else {
                // create <li class="file">
                const li = document.createElement("li")
                li.className = "file"

                li.innerHTML = `<i class="fa-solid ${getFileIcon(item.category)}"></i>
                                <span class="file-name">${item.name}</span>`

                // create <button class="size-and-download">
                const sizeAndDownloadDiv = document.createElement("div")
                sizeAndDownloadDiv.className = "size-and-download"
                sizeAndDownloadDiv.innerHTML = `<span class="file-size">${item.size}</span>`

                // create <button class="file-download">
                const fileDownloadBtn = document.createElement("button")
                fileDownloadBtn.className = "file-download"
                fileDownloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> S1'
                fileDownloadBtn.onclick = async function () {
                    fileDownloadBtn.disabled = true
                    fileDownloadBtn.innerHTML = '<i class="fa-solid fa-download fa-fade"></i> S1'
                    try {
                        const downloadLink = await item.downloadAction()
                        const anchor = document.createElement('a')
                        anchor.href = downloadLink
                        anchor.target = '_blank'
                        anchor.download = `${item.name}`
                        document.body.appendChild(anchor)
                        anchor.click()
                        document.body.removeChild(anchor)
                    } catch (error) {
                        console.error("Error:", error.message)
                    } finally {
                        fileDownloadBtn.disabled = false
                        fileDownloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> S1'
                    }
                }

                const pDownloadBtn = document.createElement("button")
                pDownloadBtn.className = "file-download"
                pDownloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> S2'
                pDownloadBtn.onclick = async function () {
                    pDownloadBtn.disabled = true
                    pDownloadBtn.innerHTML = '<i class="fa-solid fa-download fa-fade"></i> S2'
                    try {
                        const downloadLink = await item.downloadActionP()
                        const anchor = document.createElement('a')
                        anchor.href = generateRandomUrl(downloadLink)
                        anchor.target = '_blank'
                        anchor.download = `${item.name}`
                        document.body.appendChild(anchor)
                        anchor.click()
                        document.body.removeChild(anchor)
                    } catch (error) {
                        console.error("Error:", error.message)
                    } finally {
                        pDownloadBtn.disabled = false
                        pDownloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> S2'
                    }
                }
                
                const streamingBtn = document.createElement("button")
                streamingBtn.className = "file-stream"
                streamingBtn.innerHTML = '<i class="fa-solid fa-play"></i>'
                streamingBtn.onclick = async function () {
                    streamingBtn.disabled = true
                    streamingBtn.innerHTML = '<i class="fa-solid fa-play fa-fade"></i>'
                    try {
                        const shortUrl = generateRandomString(11)
                        const downloadLink = await item.downloadActionP()
                        
                        const TeraBoxData = JSON.parse(localStorage.getItem('TeraBoxData')) || []
                        await TeraBoxData.push({ 
                            name: item.name,
                            shortUrl: shortUrl,
                            downloadLink: generateRandomUrl(downloadLink)
                        })
                        
                        if (TeraBoxData.length > 10) {
                            await TeraBoxData.shift()
                        }
                        
                        await localStorage.setItem('TeraBoxData', JSON.stringify(TeraBoxData))
                        
                        const newWindow = window.open('', '_blank')
                        if (newWindow) {
                            newWindow.location = '/w/'+shortUrl
                            } else {
                            console.error('Pop-up blocked.')
                        }
                    } catch (error) {
                        console.error("Error:", error.message)
                    } finally {
                        streamingBtn.disabled = false
                        streamingBtn.innerHTML = '<i class="fa-solid fa-play"></i>'
                    }
                }

                // append fileDownloadBtn to li
                sizeAndDownloadDiv.appendChild(fileDownloadBtn)
                sizeAndDownloadDiv.appendChild(pDownloadBtn);
                if (item.category == 1) {
                    sizeAndDownloadDiv.appendChild(streamingBtn)
                }
                li.appendChild(sizeAndDownloadDiv)

                // append li to rootList
                rootList.appendChild(li)
            }
        }
    }

    function getFileIcon(category) {
        switch (category) {
            case 1:
            return "fa-file-video"
            case 2:
                return "fa-file-audio"
            case 3:
                return "fa-file-image"
            case 4:
                return "fa-file-lines"
            default:
                return "fa-file"
        }
    }

    function binding() {
        const listFuncs = []
        const listElms = []

        const folderHeaders = document.querySelectorAll(".folder-header")
        folderHeaders.forEach(function (folderHeader) {
            const parent = folderHeader.parentNode
            const children = parent.querySelector(".children")
            const iconArrow = folderHeader.querySelector(".icon-arrow")
            const iconFolder = folderHeader.querySelector(".icon-folder")
            if (!!children) {
                function cb() {
                    const isOpen = parent.getAttribute("opened") == "true"
                    parent.setAttribute("opened", !isOpen)
                    children.classList.toggle("hidden", isOpen)
                    iconArrow.querySelector(".fa-caret-right").classList.toggle("hidden", !isOpen)
                    iconArrow.querySelector(".fa-caret-down").classList.toggle("hidden", isOpen)
                    iconFolder.querySelector(".fa-folder").classList.toggle("hidden", !isOpen)
                    iconFolder.querySelector(".fa-folder-open").classList.toggle("hidden", isOpen)
                }
                folderHeader.addEventListener("click", cb)
                listFuncs.push(cb)
                listElms.push(folderHeader)
            } else {
                iconArrow.classList.add("hidden")
            }
        })

        return function unbinding() {
            for (let index = 0; index < listFuncs.length; index++) {
                const func = listFuncs[index]
                const elm = listElms[index]
                elm.removeEventListener("click", func)
            }
        }
    }

    let unbinding = function () {}

    return function (data, treeViewElement) {
        // remove event listener & clear treeViewElement
        unbinding()
        treeViewElement.innerHTML = ""

        // create rootList
        const rootList = document.createElement("ul")
        rootList.className = "root"

        // render tree view
        render(data, rootList)

        // append rootList to treeView
        treeViewElement.appendChild(rootList)

        // binding
        unbinding = binding()
    }
    
    function generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
})()

function formatStorageSize(bytes) {
    const KB = 1024
    const MB = KB * 1024
    const GB = MB * 1024

    if (bytes >= GB) {
        const gigabytes = bytes / GB
        return gigabytes.toFixed(2) + "GB"
    } else if (bytes >= MB) {
        const megabytes = bytes / MB
        return megabytes.toFixed(2) + "MB"
    } else if (bytes >= KB) {
        const kilobytes = bytes / KB
        return kilobytes.toFixed(2) + "KB"
    } else {
        return bytes.toFixed(2) + "bytes"
    }
}

function encodeUrl(rawUrl) {
    const uriEncoded = encodeURIComponent(rawUrl);
    return btoa(uriEncoded);
}

function generateRandomUrl(downloadLink) {
    const baseUrls = [
        'plain-grass-58b2.comprehensiveaquamarine',
        'royal-block-6609.ninnetta7875',
        'bold-hall-f23e.7rochelle',
        'winter-thunder-0360.belitawhite',
        'fragrant-term-0df9.elviraeducational',
        'purple-glitter-924b.miguelalocal'
    ];
    const selectedBaseUrl = baseUrls[Math.floor(Math.random() * baseUrls.length)];
    return `https://${selectedBaseUrl}.workers.dev/?url=${encodeUrl(downloadLink)}`;
}
