$().ready( () => {

    // ********** DOM MANIPULATION ********** //

    copyToClipboard = shortUrl => {
        let element = document.createElement('textarea');
        element.value = shortUrl;

        element.setAttribute('readonly', '');
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        
        document.body.appendChild(element);
        element.select();
        document.execCommand('copy');
        document.body.removeChild(element);
        alert("Copied to clipboard!");
    };

    addCopyListener = shortUrl => {
        $(`#1`).click( () => {
            copyToClipboard(shortUrl);
        });
    }

    shortenLongUrl = url => {
        if (url.length > 50) {
            url = url.substr(0, 50) + '...';
        }
        return url;
    }
    
    createAndInsertHtml = (longUrl, shortUrl) => {
        let html = `<div class="content__result">
                        <a href="${longUrl}" target="_blank" class="content__result--long">${shortenLongUrl(longUrl)}</a>
                        <a href="${shortUrl}" target="_blank" class="content__result--short">${shortUrl}</a>
                        <button id="1" class="content__result--button">Copy</button>
                    </div>`;
        $('.content__stats').prepend(html);

        addCopyListener(shortUrl);
    }

    createAndInsertError = message => {
        let html = `<div class="content__result">
                        <p class="content__result--error">${message}</p>
                    </div>`;

        $('.content__stats').prepend(html);
    }

    // ********** END OF DOM MANIPULATION ********** //




    // ********** SAVE LOCAL STATE ********** //

    isCookieSet = cookieName => {
        return document.cookie.split(';').some(
            item => item.trim().startsWith(cookieName + '=')
        );
    }

    getParsedCookies = cookieName => {
        let cookieLinks = document.cookie.replace(`${cookieName}=`, '');
        return JSON.parse(cookieLinks);
    }

    renderStoredLinks = () => {
        let long, short, parsedCookieLinks = getParsedCookies('storedLinks');

        for (let i = 0; i < parsedCookieLinks.length; i++) {
            long = decodeURIComponent(parsedCookieLinks[i].long);
            short = decodeURIComponent(parsedCookieLinks[i].short);
            createAndInsertHtml(long, short);
        }
    }

    if (isCookieSet('storedLinks')) {
        renderStoredLinks();
    }

    deleteCookies = () => {
        let cookiesArray = document.cookie.split(";");

        for (let i = 0; i < cookiesArray.length; i++) {
            let cookie = cookiesArray[i];
            let equalsPosition = cookie.indexOf("=");
            let name = equalsPosition > -1 ? cookie.substr(0, equalsPosition) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }

    createCurrentLinkObject = (longUrl, shortUrl) => {
        longUrl = encodeURIComponent(longUrl);
        shortUrl = encodeURIComponent(shortUrl);
        return {long: longUrl, short: shortUrl};
    }
        
    storeLinks = (longUrl, shortUrl) => {
        let currentLinkObject = createCurrentLinkObject(longUrl, shortUrl);

        if (isCookieSet('storedLinks')) {
            let parsedCookieLinks = getParsedCookies('storedLinks');
            parsedCookieLinks.push(currentLinkObject);

            let stringifiedLinks = JSON.stringify(parsedCookieLinks);
            document.cookie = `storedLinks=${stringifiedLinks}`;
        }
        else {
            let storedLinks = [];
            storedLinks.push(currentLinkObject);
            
            let stringifiedLinks = JSON.stringify(storedLinks);
            document.cookie = `storedLinks=${stringifiedLinks}`;
        }
    }

    // ********** END OF LOCAL STATE ********** //




    // ********** AJAX REQUEST ********** //

    getShortURL = longUrl => {
        let linkRequest = {
            destination: longUrl,
            domain: { 
                fullName: "rebrand.ly" 
            }
        }
          
        let requestHeaders = {
            "Content-Type": "application/json",
            "apikey": "6fcb8b37bf3542bfbe65a584e66edcd5",
            "workspace": "3107b1331d8341eebd1bfaa7fd5d7efa"
        }

        $.ajax({
            url: "https://api.rebrandly.com/v1/links",
            type: "post",
            data: JSON.stringify(linkRequest),
            headers: requestHeaders,
            dataType: "json",
            success: link => {
                createAndInsertHtml(link.destination, link.shortUrl);
                storeLinks(link.destination, link.shortUrl);
            },
            error: error => {
                createAndInsertError(error.responseJSON.message);
            }
        });
    }

    // ********** END OF AJAX REQUEST ********** //




    renderInputWhenError = (red, border, addLink) => {
        let color = `<style>#inputURL::placeholder{color:${red}}</style>`;
        let bordercolor = `<style>#inputURL{border:${border}}</style>`;
        $("#inputURL").append(color, bordercolor);
        
        if (addLink) {
            $("#addLink").css("visibility", "visible");
        }
        else {
            $("#addLink").css("visibility", "hidden");
        }
    }
    
    shortenURL = () => {
        // deleteCookies();
        
        renderInputWhenError('#999', 'none', null);

        let longUrl = $("#inputURL").val();

        if (longUrl) {
            getShortURL(longUrl);
        }
        else {
            renderInputWhenError('hsl(0, 87%, 67%)', 'solid .2rem hsl(0, 87%, 67%)', 'addLink');
        }
    }
});