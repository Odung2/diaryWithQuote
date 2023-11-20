# -*- coding: utf-8 -*-
"""diaryWithQuoteML.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1CFkPrJK1XEmhMDHqMxGxERcSO8xizUmu
"""

# !pip install transformers

from transformers import pipeline
import numpy as np
import sys

# 텍스트 분류 파이프라인 초기화
# classifier = pipeline("zero-shot-classification")
classifier = pipeline("zero-shot-classification", model="bert-base-multilingual-cased")


# 정의된 태그들
# tags = ["life", "motivation", "happiness", "challenges", "belief", "work", "passion", "learning", "philosophy", "simplicity"]
tags = ["삶", "동기부여", "행복", "도전", "믿음", "일", "열정", "학습", "철학", "단순함"]


# # 명언 데이터베이스
# quotes_database = [
#     {"quote": "Life is what happens when you're busy making other plans. - John Lennon", "tags": ["life", "plans"]},
#     {"quote": "The way to get started is to quit talking and begin doing. - Walt Disney", "tags": ["motivation", "action"]},
#     {"quote": "The only way to do great work is to love what you do. - Steve Jobs", "tags": ["work", "passion"]},
#     {"quote": "Whether you think you can or you think you can't, you're right. - Henry Ford", "tags": ["belief", "motivation"]},
#     {"quote": "I have not failed. I've just found 10,000 ways that won't work. - Thomas Edison", "tags": ["perseverance", "learning"]},
#     {"quote": "To live is the rarest thing in the world. Most people exist, that is all. - Oscar Wilde", "tags": ["life", "philosophy"]},
#     {"quote": "It does not matter how slowly you go as long as you do not stop. - Confucius", "tags": ["perseverance", "motivation"]},
#     {"quote": "Life is really simple, but we insist on making it complicated. - Confucius", "tags": ["life", "simplicity"]},
#     # ... 추가 명언
# ]
# 한국어 명언 데이터베이스
quotes_database = [
    {"quote": "삶이란 다른 계획을 세우고 있을 때 일어나는 일이다. - 존 레논", "tags": ["삶", "계획"]},
    {"quote": "시작하는 방법은 말을 멈추고 행동하는 것이다. - 월트 디즈니", "tags": ["동기부여", "행동"]},
    {"quote": "두려움을 느낄 시간이 있다면, 배워서 극복할 시간도 있다. - 마리 큐리", "tags": ["도전", "성장", "두려움"]},
    {"quote": "삶이 있는 한 희망은 있다. - 키케로", "tags": ["삶", "희망"]},
    {"quote": "행복은 습관이다, 그것을 몸에 지니라. - 허버드", "tags": ["행복", "습관"]},
    {"quote": "성공은 매일 반복한 작은 노력들의 합이다. - 로버트 콜리어", "tags": ["성공", "노력", "인내"]},
    {"quote": "인생에서 가장 슬픈 일은 재능이 없는 것이 아니라 재능을 사용하지 않는 것이다. - 하버트", "tags": ["인생", "재능", "자기계발"]},
    {"quote": "실패는 잊어라. 하지만 그것이 준 교훈은 절대 잊으면 안 된다. - 하버트 개서", "tags": ["실패", "교훈"]},
    {"quote": "인내할 수 있는 사람은 그가 원하는 걸 얻을 수 있다. - 벤자민 프랭클린", "tags": ["인내", "성공"]},
    {"quote": "사랑은 눈으로 보지 않고 마음으로 보는 것이다. - 헬렌 켈러", "tags": ["사랑", "마음"]},
    # ... 기타 명언
]


# 태그 추출 및 명언 추천 함수
def recommend_quote(diary_text):
    # 일기 텍스트와 태그 간의 유사성 평가
    result = classifier(diary_text, tags)
    print(result)
    labels = result['labels']
    scores = result['scores']
    sorted_tags = [tag for _, tag in sorted(zip(scores, labels), reverse=True)]

    # 상위 3개 태그 추출
    top_tags = sorted_tags[:3]
    print(top_tags)

    # 명언 매칭
    best_match = None
    best_match_score = 0

    for quote in quotes_database:
        common_tags = set(top_tags) & set(quote["tags"])
        score = len(common_tags)

        if score > best_match_score:
            best_match_score = score
            best_match = quote["quote"]

    return best_match if best_match else "적합한 명언을 찾지 못했습니다."

# # 일기 내용
# diary_text = """
# 오늘은 정말 다양한 감정을 느낀 하루였다. 경쟁에서의 도전을 겪으며 때로는 압도당하기도 하고, 때로는 큰 기쁨과 성취감을 느꼈다. 인생이란 간단하지만 우리가 복잡하게 만든다는 것을 오늘 다시 한번 깨달았다. 기다리는 마음을 가지고 성취를 위해 달려나가야 겠다.
# """
# # 명언 추천
# matching_quote = recommend_quote(diary_text)
# print("오늘의 명언:", matching_quote)

# 명령줄 인자로부터 일기 내용 받기
if len(sys.argv) > 1:
    diary_text = sys.argv[1]
else:
    diary_text = "기본 텍스트"

# 명언 추천 및 출력
matching_quote = recommend_quote(diary_text)
print(matching_quote)