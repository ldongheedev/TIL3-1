#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#include <windows.h>
#include "DoubleLinkedList.h"

int main(void) {
	SetConsoleOutputCP(65001);//UTF-8,CP는 Code Page의 약자
	SetConsoleCP(65001); // 입력도 필요하면 설정

	linkedList_h* DL = 0;
	listNode* p = 0;

	DL = createLinkedList_h();  // 공백 리스트 생성
	printf("(1) 이중 연결 리스트 생성하기! \n");
	printList(DL); 

	printf("\n(2) 이중 연결 리스트에 [월] 노드 삽입하기! \n");
	insertNode(DL, NULL, "월");
	printList(DL); 

	printf("\n(3) 이중 연결 리스트의 [월] 노드 뒤에 [수] 노드 삽입하기! \n");
	p = searchNode(DL, "월"); insertNode(DL, p, "수");
	printList(DL); 

	printf("\n(4) 이중 연결 리스트의 [수] 노드 뒤에 [금] 노드 삽입하기! \n");
	p = searchNode(DL, "수"); insertNode(DL, p, "금");
	printList(DL); 

	printf("\n(5) [수] 노드 앞에 [화] 삽입, [금] 노드 앞에 [목] 삽입하기! \n");
	p = searchNode(DL, "수"); insertBeforeNode(DL, p, "화");
	p = searchNode(DL, "금"); insertBeforeNode(DL, p, "목");
	printList(DL);

	printf("\n(6) 이중 연결 리스트 역순으로 재구성하기! \n");
	reverseList(DL);
	printList(DL); 

	printf("\n(7) 리스트 첫 번째에 [일] 노드 삽입하기! \n");
	insertFirstNode(DL, "일");
	printList(DL);

	free(DL);
	//getchar();  
	
	return 0;
}