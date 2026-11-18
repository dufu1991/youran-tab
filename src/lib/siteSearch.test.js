import { describe, expect, test } from 'bun:test'
import { getSiteHost, searchSites, shouldAutoSelect } from './siteSearch.js'

const site = (id, name, url) => ({ id, name, url })

const items = [
  site('gh', 'GitHub', 'https://github.com'),
  site('yt', 'YouTube', 'https://www.youtube.com'),
  site('gm', 'Gmail', 'https://mail.google.com/mail/u/0/'),
  {
    id: 'work',
    type: 'folder',
    name: '工作',
    items: [
      site('jira', '项目看板', 'https://team.atlassian.net/jira'),
      site('docs', 'Google Docs', 'https://docs.google.com'),
    ],
  },
]

const ids = (results) => results.map((entry) => entry.site.id)

describe('getSiteHost', () => {
  test('去掉 www. 并转为小写', () => {
    expect(getSiteHost('https://WWW.YouTube.com/watch')).toBe('youtube.com')
  })

  test('网址不合法时返回原始字符串', () => {
    expect(getSiteHost('not a url')).toBe('not a url')
  })
})

describe('searchSites', () => {
  test('空查询不返回结果', () => {
    expect(searchSites(items, '   ')).toEqual([])
  })

  test('名称前缀优先，忽略大小写', () => {
    expect(ids(searchSites(items, 'git'))).toEqual(['gh'])
  })

  test('可以搜到文件夹内的网站，并带上文件夹路径', () => {
    const [result] = searchSites(items, '看板')
    expect(result.site.id).toBe('jira')
    expect(result.site.folderPath).toBe('工作')
  })

  test('主机名的任意一段都可以前缀匹配', () => {
    expect(ids(searchSites(items, 'google'))).toEqual(['docs', 'gm'])
  })

  test('按文件夹名称匹配其中的网站', () => {
    expect(ids(searchSites(items, '工作'))).toEqual(['jira', 'docs'])
  })

  test('多个关键词需要全部命中', () => {
    expect(ids(searchSites(items, '工作 jira'))).toEqual(['jira'])
    expect(searchSites(items, '工作 youtube')).toEqual([])
  })

  test('同分时点击次数多的排在前面', () => {
    const twins = [site('a', 'Notes A', 'https://a.example.com'), site('b', 'Notes B', 'https://b.example.com')]
    expect(ids(searchSites(twins, 'notes'))).toEqual(['a', 'b'])
    expect(ids(searchSites(twins, 'notes', { b: 5 }))).toEqual(['b', 'a'])
  })

  test('结果数量受 limit 限制', () => {
    expect(searchSites(items, 'o', {}, 2)).toHaveLength(2)
  })
})

describe('shouldAutoSelect', () => {
  test('名称或域名前缀匹配时默认选中', () => {
    expect(shouldAutoSelect(searchSites(items, 'you'))).toBe(true)
    expect(shouldAutoSelect(searchSites(items, 'atlassian'))).toBe(true)
  })

  test('只是包含关键词时不默认选中，回车仍然搜索网页', () => {
    expect(shouldAutoSelect(searchSites(items, 'hub'))).toBe(false)
    expect(shouldAutoSelect([])).toBe(false)
  })
})
