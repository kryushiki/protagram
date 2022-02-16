import{_ as a,c as e,o as t,a as r}from"./app.505c8123.js";const d='{"title":"vagrantでapacheの再起動ができない時の対処法","description":"","frontmatter":{"title":"vagrantでapacheの再起動ができない時の対処法","date":"2017-03-02T00:00:00.000Z","author":"Kuriya Ushiki","gravatar":"eca93da2c67aadafe35d477aa8f454b8","category":"infrastructure","tags":["apache","vagrant"]},"headers":[{"level":2,"title":"エラー内容","slug":"エラー内容"},{"level":2,"title":"解決方法","slug":"解決方法"},{"level":3,"title":"参考サイト","slug":"参考サイト"}],"relativePath":"posts/20170302.md","lastUpdated":1644987604338}',o={},n=[r('<p>vagrant実行中にパソコンを再起動してしまい、vagrantが中断していたのでvagrant upし直してたのですが、サイトが表示されなかったのでapacheを再起動したところstartに失敗しました。</p><hr><p>vagrant実行中にパソコンを再起動してしまい、vagrantが中断していたのでvagrant upし直してたのですが、サイトが表示されなかったのでapacheを再起動したところstartに失敗しました。その時のエラーが以下です。</p><h2 id="エラー内容" tabindex="-1">エラー内容 <a class="header-anchor" href="#エラー内容" aria-hidden="true">#</a></h2><div class="language-"><pre><code>$ service httpd restart\nStopping httpd:                                            [  OK  ]\nStarting httpd: (98)Address already in use: make_sock: could not bind to address [::]:80\n(98)Address already in use: make_sock: could not bind to address 0.0.0.0:80\nno listening sockets available, shutting down\nUnable to open logs\n                                                           [FAILED]\n</code></pre></div><h2 id="解決方法" tabindex="-1">解決方法 <a class="header-anchor" href="#解決方法" aria-hidden="true">#</a></h2><p>ポートを占領しているプロセスを確認 <code>$ sudo lsof -i | grep http</code></p><p>以下の文言が帰ってきた場合はlsofをインストールする <code>sudo: lsof: command not found</code></p><p>以下のコマンドでlsofをインストール <code>sudo yum install lsof</code> もともとインストールされていれば実行する必要はない</p><p>再度プロセスを確認</p><blockquote><p></p></blockquote><div class="language-"><pre><code>$ sudo lsof -i | grep http\nhttpd    27512   apache    4u  IPv6  90360      0t0  TCP *:http (LISTEN)\nhttpd    27520   apache    4u  IPv6  90360      0t0  TCP *:http (LISTEN)\n</code></pre></div><p>プロセスをkillする</p><blockquote></blockquote><div class="language-"><pre><code>$ sudo kill -9 27512\n$ sudo kill -9 27520\n</code></pre></div><p>表示されたプロセスすべてを消して問題ない</p><p><code>service httpd restart</code></p><p>これでうまく行った。</p><h3 id="参考サイト" tabindex="-1">参考サイト <a class="header-anchor" href="#参考サイト" aria-hidden="true">#</a></h3><p><a href="http://qiita.com/ysk24ok/items/ffe8d5d1479aaf5afeaa" target="_blank" rel="noopener noreferrer">他プロセスがポートを占有してhttpdを再起動できない</a><a href="http://tweeeety.hateblo.jp/entry/20131209/1386595047" target="_blank" rel="noopener noreferrer">lsofコマンドでポートを使用しているプロセスを確認するメモ</a></p>',20)];var s=a(o,[["render",function(a,r,d,o,s,p){return t(),e("div",null,n)}]]);export{d as __pageData,s as default};