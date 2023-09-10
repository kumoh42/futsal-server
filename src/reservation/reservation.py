import time
from datetime import datetime
import pymysql
import calendar
import traceback
import requests
import urllib.parse
import json
import xml.etree.ElementTree

SERVICE_KEY = 'sPWOL4v2MOAE7sUq055%2BwdPT7voiyC2O97JQXNOnraKoP1hYApVuDOdnqZo9Q%2Bvz7olpXweaxcfSUJW1euhSGA%3D%3D'
headers = {'Content-Type': 'application/json; charset=utf-8'}
url = 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo'

conn = pymysql.connect(host='database-1.ctfthgy5wmxb.ap-northeast-2.rds.amazonaws.com', user='admin', password='emm05235', db='xe_home')

'''
    Config 정보를 불러온다.
'''
def loadConfig():
    with conn.cursor(cursor=pymysql.cursors.DictCursor) as cursor:
        cursor.execute("SELECT * FROM xe_reservation_config")
        rows = cursor.fetchall()
        config = dict()
        for item in rows:
            value = item['value']

            if value == 'Y':
                value = True
            elif value == 'N':
                value = False

            config[item['key']] = value

        cursor.close()
        return config
'''
휴일 데이터를 생성한다.
'''
def getHoliday(dt):
    # 국정공휴일 api 요청 후 목록화
    queryParams = {
        'ServiceKey' : urllib.parse.unquote(SERVICE_KEY),
        'solYear' : dt.strftime('%Y'),
        'solMonth' : dt.strftime('%m'),
    }

    res = requests.get(url, headers=headers, params=queryParams)

    holiday_list = list()

    if res.status_code == 200:
        e = xml.etree.ElementTree.fromstring(res.text)
        header = e.find('header')
        body = e.find('body')
        resultCode = header.find('resultCode').text
        if(resultCode == '00'):
            items = body.find('items').findall('item')
            for item in items:
                dateName = item.find('dateName').text
                locdate = item.find('locdate').text
                holiday_list.append([dateName, datetime.strptime(locdate, '%Y%m%d')])

    for day in range(1, calendar.monthrange(dt.year, dt.month)[1]+1):
        d_on_day = dt.replace(year=dt.year, month=dt.month, day=day)
        if d_on_day.weekday() == 5:
            holiday_list.append(['토요일', d_on_day])
        elif d_on_day.weekday() == 6:
            holiday_list.append(['일요일', d_on_day])
    return holiday_list

'''
사전 예약 테이블 데이터를 생성한다
'''
def makeTimeDataForPreReservation(dt):
    with conn.cursor(cursor=pymysql.cursors.DictCursor) as cursor:

        next_month = dt.month+1
        if next_month > 12:
            next_month = 1
            dt = dt.replace(year=dt.year+1)

        next_dt = dt.replace(month=next_month, day=1)
        cursor.execute("SELECT * FROM xe_reservation_pre")
        holiday = getHoliday(next_dt)
        if len(cursor.fetchall()) > 0:
            cursor.execute("TRUNCATE TABLE xe_reservation_pre")

        for day in range(1, calendar.monthrange(next_dt.year, next_dt.month)[1]+1):
            date = next_dt.replace(year=next_dt.year, month=next_dt.month, day=day)
            
            is_holiday = 'N'
            for h_day in holiday:
                if h_day[1].day == date.day:
                    is_holiday = 'Y'
                    break

            for hour in range(8, 21, 2):
                cursor.execute('INSERT INTO xe_reservation_pre(date, time, is_able, is_holiday) VALUES(%s, %s, %s, %s)', (date.strftime('%Y-%m-%d'), hour, 'Y', is_holiday))
                
            conn.commit()
        cursor.close()

'''
정식 예약 테이블을 생성하고 기존 데이터를 이전한다.
예약은 중단한다.
'''
def makeTimeDataForReservation(dt):
    with conn.cursor(cursor=pymysql.cursors.DictCursor) as cursor:

        next_month = dt.month+1
        if next_month > 12:
            next_month = 1
            dt = dt.replace(year=dt.year+1)

        next_dt = dt.replace(month=next_month, day=1)

        # 정식 예약 테이블을 조회하고 이미 데이터가 있으면 더 이상 진행하지 않는다.
        cursor.execute("SELECT * FROM xe_reservation WHERE date like %s", (next_dt.strftime('%Y-%m') + '%'))
        if len(cursor.fetchall()) > 0:
            print('이미 작업이 완료되어 종료')
            return

        holiday = getHoliday(next_dt)
        
        # 사전 예약 테이블을 조회한다.
        cursor.execute("SELECT * FROM xe_reservation_pre WHERE date like %s", (next_dt.strftime('%Y-%m') + '%'))
        pre_data = cursor.fetchall()
        reservation_list = dict()

        for v in pre_data:
            if not v['member_srl'] == None:
                if int(v['member_srl']) > 0:
                    nick = v['date'] + '/' + str(v['time'])
                    if nick in reservation_list.keys():
                        reservation_list[nick]['count'] = reservation_list[nick]['count'] + 1
                        reservation_list[nick]['item'].append(v)
                    else:
                        reservation_list[nick] = {'item' : [v], 'count':1}

        
        for day in range(1, calendar.monthrange(next_dt.year, next_dt.month)[1]+1):
            date = next_dt.replace(year=next_dt.year, month=next_dt.month, day=day)
            str_date = date.strftime('%Y-%m-%d')
            is_holiday = 'N'
            for h_day in holiday:
                if h_day[1].day == date.day:
                    is_holiday = 'Y'
                    break

            for hour in range(8, 21, 2):
                cursor.execute('INSERT INTO xe_reservation(date, time, is_able, is_holiday) VALUES(%s, %s, %s, %s)', (str_date, hour, 'N', is_holiday)) # 정식 데이터 생성

                for k in reservation_list.keys():
                    key = k.split('/')
                    count = reservation_list[k]['count']
                    item = reservation_list[k]['item']
                    if count == 1 and str_date == key[0] and hour == int(key[1]):
                        data = item[0]
                        cursor.execute('UPDATE xe_reservation SET member_srl=%s, place_srl=%s, circle=%s, major=%s WHERE date=%s and time=%s', (data['member_srl'], data['place_srl'], data['circle'], data['major'], str_date, hour ))
        
        cursor.execute("TRUNCATE TABLE xe_reservation_pre")
        conn.commit()
        cursor.close()

'''
정식 예약 테이블을 오픈한다.
'''
def openTimeDataForReservation(dt):
    with conn.cursor(cursor=pymysql.cursors.DictCursor) as cursor:

        next_month = dt.month + 1
        if next_month > 12:
            next_month = 1
            dt = dt.replace(year=dt.year+1)

        next_dt = dt.replace(year=dt.year, month=next_month, day=1)
        cursor.execute("UPDATE xe_reservation SET is_able='N' WHERE date like %s", (dt.strftime('%Y-%m') + '%'))
        cursor.execute("UPDATE xe_reservation SET is_able='Y' WHERE date like %s", (next_dt.strftime('%Y-%m') + '%'))
        conn.commit()
        cursor.close()
    pass

'''
    지정한 시간이 지났을 경우 True 를 반환한다.
'''
def string_time_to_datetime(date, time):
    hour = int(time)
    if hour < 10:
        hour = '0' + str(hour)
    else:
        hour = str(hour)
    string_time = date + ' ' + hour + ':00:00'
    dt = datetime.strptime(string_time, '%Y-%m-%d %H:%M:%S')
    return dt


if __name__ == '__main__':

    try:
        config = loadConfig()

        now = datetime.now()
        start_dt = string_time_to_datetime(config['start_date'], config['start_time'])
        end_dt = string_time_to_datetime(config['end_date'], config['end_time'])
        open_dt = string_time_to_datetime(config['open_date'], config['open_time'])

        if config['is_pre_reservation_period']:
            if start_dt < now and end_dt > now and start_dt.day == now.day and start_dt.hour == now.hour: # 다음달의 예약 캘린더 생성 및 오픈
                print('사전 예약 시작')
                # makeTimeDataForPreReservation(start_dt)
                # pass

            if start_dt < now and end_dt < now and end_dt.day == now.day and end_dt.hour == now.hour: # 다음달의 예약 캘린더 폐쇄 및 정식 데이터로 이전, 정식 데이터 폐쇄
                print('사전 예약 종료')
                # makeTimeDataForReservation(end_dt)
                # pass
        
        if open_dt <= now and open_dt.day == now.day and open_dt.hour == now.hour: # 다음달의 예약 데이터 오픈
            print('정식 예약 시작')
            # openTimeDataForReservation(open_dt)
            # pass
            

    except Exception as e:
        
        requests.post('https://kumoh42.com/modules/api/webhooks/handleErrorReport.php', fields={
            'title' : '오류 리포트 : 체육시설예약체계 응용 모듈',
            'body' : str(e),
            'from' : 'develop/reservation/reservation.py',
            'target' : 'service',
            'stacktrace' : traceback.format_exc()
        })

    finally:
        print('CLOSE MYSQL')
        conn.close()