CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -O2
TARGET = card_game
SRC = card_game.c
OBJ = card_game.o

all: $(TARGET)

$(TARGET): $(OBJ)
    $(CC) $(CFLAGS) -o $(TARGET) $(OBJ)

$(OBJ): $(SRC)
    $(CC) $(CFLAGS) -c $(SRC)

run: $(TARGET)
    ./$(TARGET)

clean:
    rm -f $(OBJ) $(TARGET)

.PHONY: all run clean
