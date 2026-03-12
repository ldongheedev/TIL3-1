#include<stdio.h>
// #include <windows.h>

int main()
{
	//SetConsoleOutputCP(65001); //UTF-8이 안되면
	//SetConsoleCP(65001); // 입력도 필요

	int i = 5; // '=' = assign 
	//if(i == 5) // '==' = equal
	printf("i=%d\n", i);
	printf("Address of i = %d\n", &i);
	printf("Address of i = %p\n", &i);
	printf("i의 시작주소 = %X\n", &i);
	int* pi = 0; // 아직은 아무데도 가리키지 말아라     // * 기호가 하나 있는걸 단일 포인터 함수라고 함
	pi = &i;

	printf("pi = %p\n", pi);
	printf("*pi = %d\n", *pi);
	int k = 7;
	int* pk = &k;
	printf("*pk = %d\n", *pk);
	*pk = *pi; // k = 5;
	printf("final k = %d\n", k);

	int* *p2i = &pi;
	printf("pi의 시작 주소 = %p\n", &pi);
	printf("p2i가 저장한 주소 = %p\n", p2i);
	printf("*p2i가 가리키는 공간 안에 있는 주소 = %p\n", *p2i);
	printf("**p2i가 가리키는 공간 안에 있는 주소 = %d\n", **p2i);

	int*** p3i = &p2i;
	printf("p2i의 시작 주소 = %p\n", &p2i);
	printf("p3i가 저장하고 있는 주소 = %p\n", p3i);
	printf("***p3i가 가리키는 공간 안에 있는 주소 = %d\n", ***p3i);

	return 0;
}


------------------------

#include<stdio.h>

int main() {
	int i = 0;
	int sale[4] = { 10, 20, 30, 40 };
	int other[4] = { 0, };
	//sale = other; //sale 배열변수가 가진 주소는 상수화되어 수정 불가

	for (i = 0; i < 4; i++)
	{
		printf("\n address:%u sale[%d] = %d", &sale[i], i, sale[i]);
	}
	printf("\n");

	int num[2][4] = { { 10, 20, 30, 40 }, { 50, 60, 70, 80 } };

	int* ptr = num;
	//int* ptr = &num[0][0];
	printf("num[0][1]=%d\n", num[0][1]);
	printf("*(ptr+1)=%d\n", *(ptr+1));
	printf("num[1][3]=%d\n", num[1][3]);
	printf("*(ptr+7)=%d\n", *(ptr + 7));


	return 0;
}
