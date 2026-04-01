#!/usr/bin/env python3
"""
Fix translation JSON files:
1. Re-parse follow-up questions with multilingual yes/no detection (ES/FR/PT)
2. Normalize strategy examples with bullet (•) prefix across all languages
"""
import csv
import json
import re
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

QUESTION_CODE_MAP = {
    1: 'M01', 2: 'M02', 3: 'M03', 4: 'M04', 5: 'M05', 6: 'M06', 7: 'M07', 8: 'M08',
    9: 'E01', 10: 'E02', 11: 'E03', 12: 'E04', 13: 'E05', 14: 'E06', 15: 'E07', 16: 'E08',
    17: 'E09', 18: 'E10', 19: 'E11', 20: 'E12', 21: 'E13',
    22: 'I01', 23: 'I02', 24: 'I03', 25: 'I04', 26: 'I05', 27: 'I06', 28: 'I07',
    29: 'I08', 30: 'I09', 31: 'I10',
}

YES_PATTERNS = [
    r'\bif\b.*\byes\b',                          # English
    r'\bsi\b.*respuesta.*s[ii\xed]',             # Spanish
    r'\bsi\b.*r[e\xe9]ponse.*\boui\b',          # French
    r'\bse\b.*respostar?.*\bsim\b',              # Portuguese
]
NO_PATTERNS = [
    r'\bif\b.*\bno\b',                           # English
    r'\bsi\b.*respuesta.*\bno\b',                # Spanish
    r'\bsi\b.*r[e\xe9]ponse.*\bnon\b',          # French
    r'\bse\b.*respostar?.*n[a\xe3]o\b',          # Portuguese
]
PREFIX_PATTERNS = [
    # English: "If yes, then" / "If no, then"
    r'^if\s*[\u201c\u201d\u2018\u2019]?\s*(yes|no)\s*[\u201c\u201d\u2018\u2019,]*\s*(then\s*)?',
    # Spanish: "Si la respuesta es 'si/no',"
    r'^si\s+la\s+respuesta\s+es\s*[\u201c\u201d\u2018\u2019"\']*\s*(s[i\xed]|no)\s*[\u201c\u201d\u2018\u2019"\',.]*\s*',
    # French: "Si la reponse est 'oui/non',"
    r'^si\s+la\s+r[e\xe9]ponse\s+est\s*[\u00ab\u00bb\u201c\u201d"\']*\s*(oui|non)\s*[\u00ab\u00bb\u201c\u201d"\',.]*\s*',
    # Portuguese: "Se a resposta for 'sim/nao',"
    r'^se\s+a\s+respostar?\s+for\s*[\u201c\u201d\u2018\u2019"\']*\s*(sim|n[a\xe3]o)\s*[\u201c\u201d\u2018\u2019"\',.]*\s*',
]


def parse_follow_up_multilingual(text):
    """Parse follow-up questions with multilingual yes/no bucket detection."""
    if not text:
        return None

    raw = text.replace('\u2022', '\n').replace('\ufffd', '').replace('\xef\xbf\xbd', '')
    lines = raw.split('\n')
    lines = [re.sub(r'^[\s\-*]\s*', '', line).strip() for line in lines]
    lines = [line for line in lines if line]

    result = {'if yes': [], 'if no': []}

    for line in lines:
        lower = line.lower()

        cleaned = line
        for pat in PREFIX_PATTERNS:
            cleaned = re.sub(pat, '', cleaned, flags=re.IGNORECASE).strip()

        cleaned = (cleaned
                   .replace('\u201c', '"').replace('\u201d', '"')
                   .replace('\u2018', "'").replace('\u2019', "'")
                   .strip())
        if cleaned:
            cleaned = cleaned[0].upper() + cleaned[1:]

        is_no = any(re.search(p, lower) for p in NO_PATTERNS)
        is_yes = any(re.search(p, lower) for p in YES_PATTERNS)

        if is_no:
            result['if no'].append(cleaned)
        elif is_yes:
            result['if yes'].append(cleaned)
        else:
            result['if yes'].append(cleaned)

    output = {}
    if result['if yes']:
        output['if yes'] = result['if yes']
    if result['if no']:
        output['if no'] = result['if no']
    return output if output else None


def sanitize_list_text(text):
    """Normalize list text: ensure each non-empty line has a bullet (•) prefix."""
    if not text:
        return None
    result = []
    for line in text.split('\n'):
        line = (line.strip()
                .replace('\u201c', '"').replace('\u201d', '"')
                .replace('\u2018', "'").replace('\u2019', "'"))
        if not line:
            continue
        if not line.startswith('\u2022'):
            line = '\u2022 ' + line
        # Strip stray hyphen/dash markers after the bullet: "• - item" → "• item"
        line = re.sub(r'^\u2022\s*[-\u2013\u2014]\s+', '\u2022 ', line)
        result.append(line)
    return '\n'.join(result) if result else None


def fix_language(lang, csv_filename):
    json_path = os.path.join(BASE, 'src', 'i18n', 'translations', f'questions-{lang}.json')
    csv_path = os.path.join(BASE, 'docs', 'resources', csv_filename)

    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)

    with open(csv_path, encoding='utf-8', errors='replace') as f:
        rows = list(csv.DictReader(f))

    fup_count = 0
    strat_count = 0

    for row in rows:
        try:
            row_num = int(row.get('id', '').strip())
            code = QUESTION_CODE_MAP.get(row_num)
        except (ValueError, TypeError):
            continue

        if not code or code not in data:
            continue

        raw_fup = row.get('Follow up question(s)', '')
        parsed = parse_follow_up_multilingual(raw_fup)
        if parsed is not None:
            new_val = json.dumps(parsed, ensure_ascii=False)
            if data[code].get('followUpQuestions') != new_val:
                data[code]['followUpQuestions'] = new_val
                fup_count += 1

        raw_strat = row.get('Examples of strategies to address gap in key factor', '')
        sanitized = sanitize_list_text(raw_strat)
        if sanitized and data[code].get('strategyExamples') != sanitized:
            data[code]['strategyExamples'] = sanitized
            strat_count += 1

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'{lang}: {fup_count} followUpQuestions updated, {strat_count} strategyExamples updated')


def fix_english_strategy_bullets():
    json_path = os.path.join(BASE, 'src', 'i18n', 'translations', 'questions-en.json')
    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)

    updated = 0
    for code, q in data.items():
        strat = q.get('strategyExamples')
        if strat:
            fixed = sanitize_list_text(strat)
            if fixed and fixed != strat:
                data[code]['strategyExamples'] = fixed
                updated += 1

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'en: {updated} strategyExamples normalized with bullet prefix')


def verify():
    print('\nVerification (M01):')
    for lang in ['en', 'es', 'fr', 'pt']:
        json_path = os.path.join(BASE, 'src', 'i18n', 'translations', f'questions-{lang}.json')
        with open(json_path, encoding='utf-8') as f:
            d = json.load(f)
        m01 = d.get('M01', {})
        fup = m01.get('followUpQuestions')
        fp = json.loads(fup) if isinstance(fup, str) else (fup or {})
        strat = m01.get('strategyExamples', '')
        print(f"  {lang}: if_yes={len(fp.get('if yes', []))}, if_no={len(fp.get('if no', []))}, "
              f"strat_bullet={strat.startswith(chr(0x2022))}")


if __name__ == '__main__':
    fix_language('es', 'questions-es.csv')
    fix_language('fr', 'questions-fr.csv')
    fix_language('pt', 'questions-pt.csv')
    fix_english_strategy_bullets()
    verify()
