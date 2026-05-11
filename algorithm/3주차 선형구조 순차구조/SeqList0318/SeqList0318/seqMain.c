#include <stdio.h>
#include<windows.h>
#include "listS.h"

int main(void)
{
    SetConsoleOutputCP(65001);//UTF-8,CP는 Code Page의 약자
    SetConsoleCP(65001); // 입력도 필요하면 설정

    int list[MAX] = { 10, 20, 40, 50, 60, 70 }; //배열 매개변수로 선언된 배열변수는 주소 변경 가능
    int i = 0, move = 0, size = 6;  //size는 리스트에 있는 원소의 개수
    printf("\n삽입 전 선형 리스트 : ");
    for (i = 0; i < size; i++)
        printf("%3d ", list[i]);
    printf("\n원소의 갯수 : %d \n", size);

    move = insertElement(list, size, 30);

    printf("\n삽입 후 선형 리스트 : ");
    for (i = 0; i <= size; i++)
        printf("%3d ", list[i]);
    printf("\n원소의 갯수 : %d ", ++size);
    printf("\n자리 이동 횟수 : %d \n", move);

    printf("원소 30을 삭제전 size=%d\n", size);
    move = deleteElement(list, size, 30);
    if (move == size)
        printf("\n선형 리스트에 원소가 없어서 삭제할 수 없습니다.\n");
    else {
        printf("\n삭제 후 선형 리스트 : ");
        for (i = 0; i < size - 1; i++)
            printf("%3d ", list[i]);
        printf("\n원소의 갯수 : %d ", --size);
        printf("\n자리 이동 횟수 : %d \n", move);
    }

    //getchar();  
    return 0;
}