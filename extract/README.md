# Dostępne zbiory danych

**Tabele**

- [ICDAR 2019](http://sac.founderit.com/dataset-training.html)
- [ICDAR 2013](http://www.tamirhassan.com/html/dataset.html)

**Wyresy**

- [ICDAR 2019](https://chartinfo.github.io/)
- [Stanford Revision](http://vis.stanford.edu/papers/revision)
- [Maluuba FigureQA](https://datasets.maluuba.com/FigureQA)

# Instrukcja

Kod jest zorganizowany z założeniem, że katalog 'extract' jest katalogiem roboczym.

## Generowanie wykresów

Katalogi 'blank_articles' oraz 'nonblank_articles' zawierają przykładowe zbiory dokumentów **PDF**.

Katalog charts zawiera przykładowe wykresy pogrupowane wg klas.

Aby wygenerować dokumenty, należy ustawić zmienną 'doc_no' (pożądana liczba dokumentów każdego typu) w pliku 'generate_plots.py' oraz go uruchomić. Jeśli dokonano jakiejkolwiek zmiany w strukturze wyżej wymienionych katalogów, plik musi zaktualizowany zmieniony adekwatnie do tej zmiany.

## Tworzenie zbioru danych wykresów w formacie Pascal VOC

W pliku 'transform_plots.py' należy ustawić listę mapującą klasy poszczególnych katalogów z wykresami (drugi argument funkcji) adekwatnie do potrzeb, a następnie uruchomić skrypt.

## Tworzenie zbioru danych tabel w formacie Pascal VOC

Skrypt działa tylko ze zbiorem ICDAR2019.
Jako parametry wejściowe należy podać katalog 'ground_truth' w.w. zbioru, katalog docelowy oraz opcjonalnie ilość wątków, na których obliczenia mają być zrównoleglone.