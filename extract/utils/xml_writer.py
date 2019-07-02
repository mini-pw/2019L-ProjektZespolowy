import xml.etree.ElementTree as ET


class XMLWriter:
    def create_faster_rcnn_xml(self, filename, folder, path, png_width, png_height, x1, y1, x2, y2,
                               destination_name, class_name=1):
        annotation = ET.Element('annotation')

        ET.SubElement(annotation, 'folder').text = folder

        ET.SubElement(annotation, 'filename').text = filename

        ET.SubElement(annotation, 'path').text = path

        sourceXML = ET.SubElement(annotation, 'source')
        ET.SubElement(sourceXML, 'database').text = 'Unknown'

        sizeXML = ET.SubElement(annotation, 'size')
        ET.SubElement(sizeXML, 'width').text = str(png_width)
        ET.SubElement(sizeXML, 'height').text = str(png_height)
        ET.SubElement(sizeXML, 'depth').text = '3'

        ET.SubElement(annotation, 'segmented').text = '0'

        objectXML = ET.SubElement(annotation, 'object')
        ET.SubElement(objectXML, 'name').text = str(class_name)
        ET.SubElement(objectXML, 'pose').text = 'Frontal'
        ET.SubElement(objectXML, 'truncated').text = '0'
        ET.SubElement(objectXML, 'difficult').text = '0'
        ET.SubElement(objectXML, 'occluded').text = '0'
        bndboxXML = ET.SubElement(objectXML, 'bndbox')
        ET.SubElement(bndboxXML, 'xmin').text = str(x1)
        ET.SubElement(bndboxXML, 'xmax').text = str(x2)
        ET.SubElement(bndboxXML, 'ymin').text = str(y1)
        ET.SubElement(bndboxXML, 'ymax').text = str(y2)

        file_content = ET.tostring(annotation, encoding="unicode")
        output_file = open(destination_name, "w")
        output_file.write(file_content)

    def create_faster_rcnn_xml_multiple(self, filename, folder, path, png_width, png_height, coords,
                               destination_name, class_name=1):
        annotation = ET.Element('annotation')

        ET.SubElement(annotation, 'folder').text = folder

        ET.SubElement(annotation, 'filename').text = filename

        ET.SubElement(annotation, 'path').text = path

        sourceXML = ET.SubElement(annotation, 'source')
        ET.SubElement(sourceXML, 'database').text = 'Unknown'

        sizeXML = ET.SubElement(annotation, 'size')
        ET.SubElement(sizeXML, 'width').text = str(png_width)
        ET.SubElement(sizeXML, 'height').text = str(png_height)
        ET.SubElement(sizeXML, 'depth').text = '3'

        ET.SubElement(annotation, 'segmented').text = '0'

        for coord in coords:
            objectXML = ET.SubElement(annotation, 'object')
            ET.SubElement(objectXML, 'name').text = str(class_name)
            ET.SubElement(objectXML, 'pose').text = 'Frontal'
            ET.SubElement(objectXML, 'truncated').text = '0'
            ET.SubElement(objectXML, 'difficult').text = '0'
            ET.SubElement(objectXML, 'occluded').text = '0'
            bndboxXML = ET.SubElement(objectXML, 'bndbox')
            ET.SubElement(bndboxXML, 'xmin').text = str(coord[0])
            ET.SubElement(bndboxXML, 'xmax').text = str(coord[1])
            ET.SubElement(bndboxXML, 'ymin').text = str(coord[2])
            ET.SubElement(bndboxXML, 'ymax').text = str(coord[3])

        file_content = ET.tostring(annotation, encoding="unicode")
        output_file = open(destination_name, "w")
        output_file.write(file_content)


if __name__ == '__main__':
    XMLWriter().create_faster_rcnn_xml('000001.png', 'GeneratedData_Train', '/my/path/GeneratedData_Train/000001.png',
                                       224, 224, 82, 172, 88, 146, 'out.xml', 21)

