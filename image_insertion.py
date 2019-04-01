import fitz

doc = fitz.open('article.pdf')
rect = fitz.Rect(30, 30, 200, 200)
file = open("terminal_eps.png", "rb")
img = file.read()
file.close()

doc[2].insertImage(rect, stream=img)


doc.save("article3.pdf")