const PDFDocument = require("pdfkit");
const { getNestedKey } = require("../util/utils");

module.exports.createPdf = async (req, res) => {
  try {
    const pages = req.body;
    const pageArr = Object.values(pages);
    const pageSize = [595, 420];
    const doc = new PDFDocument({ bufferPages: true, size: pageSize, font: "Helvetica" });
    const showDebugOutline = false;

    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      let pdfUrl = "data:application/pdf;base64," + pdfData.toString("base64");

      res.status(200).json({ payload: pdfUrl });
    });

    for (let index = 0; index < pageArr.length; index++) {
      try {
        if (index > 0) {
          doc.addPage({ size: pageSize });
          doc.switchToPage(index);
        }

        const pageData = pageArr[index];
        const layout = require(`../layouts/fate-core/character-${pageData.type}.json`).layout;

        const backgroundImageUrl = `./assets/fate-core/character-${pageData.type}.jpg`;
        doc.image(backgroundImageUrl, 0, 0, { width: doc.page.width, height: doc.page.height });

        for (const field of Object.keys(layout)) {
          const characterData = pageData.data;
          const layoutData = layout[field];
          const element = getNestedKey(field, characterData);

          if (!!element) {
            switch (layoutData?.type) {
              case "input":
                doc.fontSize(layoutData.fontSize).text(element, layoutData.position.x, layoutData.position.y, {
                  width: layoutData.size,
                  height: layoutData.fontSize,
                  lineBreak: false,
                  ellipsis: true,
                  align: layoutData.align ?? "left",
                });

                if (showDebugOutline) {
                  doc
                    .rect(layoutData.position.x, layoutData.position.y, layoutData.size, layoutData.fontSize)
                    .stroke("red");
                }

                if (field.includes("abilityScores")) {
                  const abilityOptions = {
                    x: layoutData.position.x,
                    y: layoutData.position.y - 28,
                    width: layoutData.size,
                    height: layoutData.fontSize + 4,
                  };

                  if (showDebugOutline) {
                    doc
                      .rect(abilityOptions.x, abilityOptions.y, abilityOptions.width, abilityOptions.height)
                      .stroke("red");
                  }

                  doc
                    .fontSize(layoutData.fontSize + 4)
                    .text(Math.floor((parseInt(element) - 10) / 2), abilityOptions.x, abilityOptions.y, {
                      width: abilityOptions.width,
                      height: abilityOptions.height,
                      lineBreak: false,
                      ellipsis: true,
                      align: "center",
                    });
                }
                break;
              case "checkbox":
                doc.circle(layoutData.position.x, layoutData.position.y, layoutData.size).fill("black");
                break;
              case "textarea":
                doc.fontSize(layoutData.fontSize).text(element, layoutData.position.x, layoutData.position.y, {
                  width: layoutData.width,
                  height: layoutData.height,
                  lineBreak: true,
                  ellipsis: true,
                });

                if (showDebugOutline) {
                  doc
                    .rect(layoutData.position.x, layoutData.position.y, layoutData.width, layoutData.height)
                    .stroke("red");
                }
                break;
              case "image":
                doc.image(element, layoutData.position.x, layoutData.position.y, {
                  fit: [layoutData.width, layoutData.height],
                  align: "center",
                  valign: "center",
                });
                break;
              default:
                console.log(layoutData.type);
            }
          }
        }
      } catch (error) {
        console.error(error);
        continue;
      }
    }

    doc.end();
  } catch (error) {
    console.log({ error });
    return res.status(400).json({ error });
  }
};
