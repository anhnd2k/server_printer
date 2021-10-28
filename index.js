const express = require("express");
const PORT = process.env.PORT || 6969;
const server = express();
const {platform} = require('process')
const upload = require("express-fileupload");
const fs = require('fs')
const PDFDocument = require('pdfkit');
const { execSync } = require('child_process');

server.use(upload())
server.use(express.json())
server.use(express.urlencoded({ extended: false }))

server.get('/printers', (req, res) => {
    if (platform == "darwin") {
        try {
            let arrayPrinter = []
            const regexString = /(?<=printer\s)(.*?\s)/g
            const rs = execSync('lpstat -p -d', { encoding: "ascii" });
            const name = rs.match(regexString);
                name.forEach(nameItem => {
                    arrayPrinter.push({name: nameItem.trim()})
                })
            return res.json(arrayPrinter)
        } catch {
            return res.json("err")
        }
    }
    // get list printer for windows
    try {
        const resPrint = execSync('wmic printer list brief', { encoding: "ascii" })
        let stdout = resPrint.split("  ");
        var printers = [];
        j = 0;
        stdout = stdout.filter(item => item);
        for (i = 0; i < stdout.length; i++) {
            if (stdout[i] == " \r\r\n" || stdout[i] == "\r\r\n") {
                printers[j] = { namePrinter: stdout[i + 1].trim(), systemName: stdout[i + 4].trim(), statusPrinter: stdout[i + 3].trim() };
                j++;
            }
        }
        res.status(200).send({ status: false, mess: "err get list printer", data: printers })
    } catch {
        res.status(404).send({ status: false, mess: "err get list printer" })
    }
})

// api post get file pdf and print file ==> oki

// server.post('/print', (req, res) => {
//     if (req.files.pdfFile, req.body.namePrinter) {
//         const printerName = req.body.namePrinter
//         const fileName = req.files.pdfFile.name
//         const pathFilePrint = __dirname + '/pdfFile/' + fileName
//         req.files.pdfFile.mv('./pdfFile/' + fileName, (err) => {
//             if (err) {
//                 return res.status(404).send({ success: false, mess: "err when save file upload" })
//             }
//             else {
//                 // print
//                 console.log("printer")
//                 if (platform == 'darwin') {
//                     const stringPrint = `lp -d ${printerName} ${pathFilePrint}`
//                     console.log(stringPrint)
//                     const resPrinter = execSync(stringPrint, { encoding: "ascii" });
//                     console.log (resPrinter)
//                 } if (platform == 'win32') {
                    
//                 }
//                 return res.status(200).send({success : true})
//             }
//         })
//     } else {
//         return res.status(500).send({ success: false, mess: "upload file err" })
//     }
// })

server.post('/test', async (req, res) => {

    // print on linux

    function print(nameFilePrint, namePrinter) {
        if (platform == 'darwin') {
            const stringPrint = `lp -d ${namePrinter} ${nameFilePrint}`
            console.log(stringPrint)
            const resPrinter = execSync(stringPrint, { encoding: "ascii" });
            console.log(resPrinter)
            return res.status(200).send({success : false, mess:"print file success"})
        } if (platform == 'win32') {
            
        }
    }

    if (req.body.base64String, req.body.type, req.body.namePrinter) {
        if (req.body.type = "IMAGE") {
            const base64Data = req.body.base64String.replace(/^data:image\/png;base64,/, "");
            require("fs").writeFile("out.png", base64Data, 'base64', function(err) {
                if (err) {
                    return res.status(505).send("Err when convert base64 to img")
                }
                convertToPDf()
            });

            function convertToPDf() {
                try {
                    doc = new PDFDocument
                    doc.pipe(fs.createWriteStream('output.pdf'))

                    doc.image('out.png', {
                        fit: [250, 300],
                        align: 'center',
                        valign: 'center'
                    });
                    doc.end()
                    //print

                    print('out.png', req.body.namePrinter)

                } catch {
                    return res.status(505).send("err convert img to pdf")
                }
            }
        }
        if (req.body.type = "PDF") {
            var bin = window.atob(stringToDecode);
            fs.writeFile('result_binary.pdf', bin, 'binary', error => {
                if (error) {
                    throw error;
                } else {
                    print('result_binary.pdf', req.body.namePrinter)
                    console.log('binary saved!');
                }
            });
        }
    }
    else {
        return res.status(404).send({success : false, mess:"err print file"})
    }
})

server.listen(PORT, '0.0.0.0', function () {
    console.log('Listening to port:  ' + PORT);
});

// electron ui
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})