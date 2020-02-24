# Tell Me Corona?
'tellmecorona'는 코로나 확진자 수가 변동되면 즉시 알려주는 텔레그램 봇 프로그램입니다.

# 사용방법
1. tellmecorona 저장소를 `clone` 받습니다.
2. `config.example.json`파일의 항목들을 입력해줍니다.
- `channel_id`는 해당 채널의 이름 ex) @tellmecorona
- `admin_id`는 스크립트가 정상적으로 작동했는지 알려주는 로깅 서비스를 받을 텔레그램의 `chat_id`
- `telegram_token`은 BotFather한테 받은 텔레그램 봇의 token
3. `config.example.json`파일의 이름을 `config.json`으로 변경해줍니다.
4. 봇의 메시지를 받고 싶다면 NODE_ENV를 production으로 변경해줍니다.
```
export NODE_ENV=production
```
# 서비스
![tellmecorona](/tellmecorona.JPG)

http://t.me/tellmecorona
