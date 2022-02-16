import{_ as t,c as e,o,a as n}from"./app.505c8123.js";const a='{"title":"WrodPressでアップロードしたメディアファイルをS3に保存して必要に応じてエンコードする方法","description":"","frontmatter":{"title":"WrodPressでアップロードしたメディアファイルをS3に保存して必要に応じてエンコードする方法","date":"2017-03-16T00:00:00.000Z","author":"Kuriya Ushiki","gravatar":"eca93da2c67aadafe35d477aa8f454b8","category":"backend","tags":["aws","s3","wordpress"]},"headers":[{"level":2,"title":"要件","slug":"要件"},{"level":2,"title":"バケットを作る","slug":"バケットを作る"},{"level":3,"title":"S3のファイルを一般公開する","slug":"s3のファイルを一般公開する"},{"level":2,"title":"パイプラインを作成する","slug":"パイプラインを作成する"},{"level":2,"title":"roleを作る","slug":"roleを作る"},{"level":2,"title":"Lambdaでエンコードの自動化","slug":"lambdaでエンコードの自動化"},{"level":2,"title":"uploadされたファイルを削除する。","slug":"uploadされたファイルを削除する。"},{"level":3,"title":"ログの見方","slug":"ログの見方"},{"level":2,"title":"Offload S3の設定","slug":"offload-s3の設定"},{"level":3,"title":"WordPressからアップした動画ファイルのURLのパスを変更する方法","slug":"wordpressからアップした動画ファイルのurlのパスを変更する方法"}],"relativePath":"posts/201703116.md","lastUpdated":1644987604493}',r={},i=[n('<p>WrodPressでアップロードしたメディアファイルをS3に保存して必要に応じてエンコードする方法</p><hr><h2 id="要件" tabindex="-1">要件 <a class="header-anchor" href="#要件" aria-hidden="true">#</a></h2><ul><li>wordpressのメディアからアップロードされたファイルをS3に保存</li><li>アップロードされたファイル形式がMOVだった場合mp4にエンコードする</li></ul><hr><h2 id="バケットを作る" tabindex="-1">バケットを作る <a class="header-anchor" href="#バケットを作る" aria-hidden="true">#</a></h2><p>サービスからS3を選択する。 「バケットを作成する」をクリックしてバケットを作成する。 ほぼデフォルトでOK。 バケット名は任意。今回は「<strong>wp-bucket</strong>」とする リージョンは東京とする。</p><h3 id="s3のファイルを一般公開する" tabindex="-1">S3のファイルを一般公開する <a class="header-anchor" href="#s3のファイルを一般公開する" aria-hidden="true">#</a></h3><p>ファイルにアクセスした時にだれでも読み込み出来るように権限を変更する必要がある。 そうしないとwordpress側などからファイルにアクセス出来なくなる。</p><p>【設定手順】</p><ol><li>バケットの「アクセス権限」をクリック</li><li>バケットポリシーをクリック</li><li>バケットポリシーエディターに以下の記述を追加 ※wp-bucketの箇所にはバケット名を入力する。</li></ol><div class="language-"><pre><code>{\n    &quot;Version&quot;: &quot;2012-10-17&quot;,\n    &quot;Statement&quot;: [\n        {\n            &quot;Sid&quot;: &quot;&quot;,\n            &quot;Effect&quot;: &quot;Allow&quot;,\n            &quot;Principal&quot;: &quot;*&quot;,\n            &quot;Action&quot;: &quot;s3:GetObject&quot;,\n            &quot;Resource&quot;: &quot;arn:aws:s3:::wp-bucket/*&quot;\n        }\n    ]\n}\n</code></pre></div><ol start="4"><li>入力したら保存する。</li></ol><p>参考サイト <a href="http://techtipshoge.blogspot.jp/2016/02/s3.html" target="_blank" rel="noopener noreferrer">http://techtipshoge.blogspot.jp/2016/02/s3.html</a></p><h2 id="パイプラインを作成する" tabindex="-1">パイプラインを作成する <a class="header-anchor" href="#パイプラインを作成する" aria-hidden="true">#</a></h2><ol><li>サービスからElastic Transcoderを選択する。</li><li>「Create a new Pipeline」をクリックする。</li><li>設定値を入力 Pipeline Nameには任意の名前をつける。英語の方がよい 今回は「wpUploadPipeline」とする。 input Bucket、 「Configuration for Amazon S3 Bucket for Transcoded Files and Playlists」のBucket、 「Configuration for Amazon S3 Bucket for Thumbnails」のbucket には全て同じバケットを設定する。今回はwp-bucket それ以外は全部デフォルトのまま。</li></ol><h2 id="roleを作る" tabindex="-1">roleを作る <a class="header-anchor" href="#roleを作る" aria-hidden="true">#</a></h2><p>権限を作る</p><ol><li>サービスからIAMを選択する。</li><li>「ロール」を選択する。</li><li>「新しいロールの作成」をクリック</li><li>ロールタイプの選択 「AWS Lambda」を選択</li><li>ポリシーのアタッチ 何も選択せずに「次のステップ」をクリック</li><li>確認</li></ol><table><thead><tr><th>項目</th><th>値</th></tr></thead><tbody><tr><td>ロール名</td><td>lambda_auto_transcoder_role (今回は←とする)</td></tr><tr><td>Role description</td><td>（空でいい）</td></tr><tr><td>信頼されたエンティティ</td><td>ID プロバイダー <a href="http://lambda.amazonaws.com" target="_blank" rel="noopener noreferrer">lambda.amazonaws.com</a>　（勝手に入ってる）</td></tr><tr><td>ポリシー</td><td>（何も選択しない）</td></tr></tbody></table><ol start="7"><li>先に作成した「lambda_auto_transcoder_role」を選択します。</li><li>インラインポリシーを開いて「表示するインラインポリシーはありません。作成するには、ここをクリックしてください。」のここをクリックする。</li><li>カスタムポリシーにチェックして「選択」する</li><li>ポリシーの確認に値を入力 ポリシー名：lambda_auto_transcoder_role_policy ポリシードキュメント</li></ol><div class="language-"><pre><code>{\n    &quot;Version&quot;: &quot;2012-10-17&quot;,\n    &quot;Statement&quot;: [\n        {\n            &quot;Effect&quot;: &quot;Allow&quot;,\n            &quot;Action&quot;: [\n                &quot;logs:CreateLogGroup&quot;,\n                &quot;logs:CreateLogStream&quot;,\n                &quot;logs:PutLogEvents&quot;\n            ],\n            &quot;Resource&quot;: &quot;arn:aws:logs:*:*:*&quot;\n        },\n        {\n            &quot;Effect&quot;: &quot;Allow&quot;,\n            &quot;Action&quot;: [\n                &quot;iam:GetRole&quot;,\n                &quot;iam:PassRole&quot;\n            ],\n            &quot;Resource&quot;: &quot;*&quot;\n        },\n        {\n            &quot;Effect&quot;: &quot;Allow&quot;,\n            &quot;Action&quot;: [\n                &quot;s3:ListBucket&quot;,\n                &quot;s3:Put*&quot;,\n                &quot;s3:Get*&quot;,\n                &quot;s3:*MultipartUpload*&quot;\n            ],\n            &quot;Resource&quot;: &quot;arn:aws:s3:::*&quot;\n        },\n        {\n            &quot;Effect&quot;: &quot;Allow&quot;,\n            &quot;Action&quot;: [\n                &quot;elastictranscoder:*&quot;\n            ],\n            &quot;Resource&quot;: &quot;*&quot;\n        },\n        {\n            &quot;Effect&quot;: &quot;Allow&quot;,\n            &quot;Action&quot;: [\n                &quot;sns:CreateTopic&quot;,\n                &quot;sns:Publish&quot;\n            ],\n            &quot;Resource&quot;: &quot;*&quot;\n        }\n    ]\n}\n</code></pre></div><blockquote><p>なお、以下のポリシーは、AWS Lambda（というか CloudWatch）、S3、Amazon Elastic Transcoder、および Amazon SNS への、今回使う機能でなるべく最小限のアクセスを許可したものになります。</p></blockquote><ol start="10"><li>「ポリシーの適用」をクリック</li><li>「信頼関係」のタブをクリックして「信頼関係の編集」をクリックする</li><li>信頼関係の編集</li></ol><div class="language-"><pre><code>{\n  &quot;Version&quot;: &quot;2012-10-17&quot;,\n  &quot;Statement&quot;: [\n    {\n      &quot;Sid&quot;: &quot;&quot;,\n      &quot;Effect&quot;: &quot;Allow&quot;,\n      &quot;Principal&quot;: {\n        &quot;Service&quot;: [\n          &quot;lambda.amazonaws.com&quot;,\n          &quot;elastictranscoder.amazonaws.com&quot;\n        ]\n      },\n      &quot;Action&quot;: &quot;sts:AssumeRole&quot;\n    }\n  ]\n}\n</code></pre></div><p>これで「<a href="http://elastictranscoder.amazonaws.com" target="_blank" rel="noopener noreferrer">elastictranscoder.amazonaws.com</a>」が追加される。</p><h2 id="lambdaでエンコードの自動化" tabindex="-1">Lambdaでエンコードの自動化 <a class="header-anchor" href="#lambdaでエンコードの自動化" aria-hidden="true">#</a></h2><p>S3にファイルがアップロードされる。 movファイルだった場合Lambdaの処理が走る。 ■処理内容 Elastic TranscoderにアクセスしてJobを作ってそのJobを使ってエンコードする。 今回はmov形式のファイルをmp4にエンコードしたいのでElastic TranscoderのPresetsにある「System preset: Generic 320x240」を使ってエンコードします。</p><p>【設定手順】</p><ol><li>サービスからLambdaを選択。右上からリージョンを東京に変更。ここはバケットで指定したリージョンと合わせる。</li><li>「s3-get-object-python」を選択</li><li>トリガーを設定する ■設定値</li></ol><table><thead><tr><th>項目</th><th>値</th></tr></thead><tbody><tr><td>バケット</td><td>wp-bucket</td></tr><tr><td>イベントタイプ</td><td>オブジェクトの作成 (すべて)</td></tr><tr><td>プレフィックス</td><td>（今回は設定しない。こちらでバケットのディレクトリを限定することが出来る）</td></tr><tr><td>サフィックス</td><td>mov</td></tr><tr><td>これでwp-bucketというバケットにオブジェクトの作成 (すべて)されて、そのファイルが.movというファイルだった時に処理が走るということになる。</td><td></td></tr><tr><td>[トリガーの有効化]にチェックをつける。</td><td></td></tr></tbody></table><blockquote><p>今すぐトリガーを有効化するか、テスト用に無効化した状態でトリガーを作成します (推奨)。</p></blockquote><ol start="4"><li>関数を設定する ■設定値</li></ol><table><thead><tr><th>名前*</th><th>autoTranscoder (任意だが今回はautoTranscoderとする)</th></tr></thead><tbody><tr><td>説明</td><td>(任意)</td></tr><tr><td>ランタイム*</td><td>Python 2.7</td></tr></tbody></table><ol start="5"><li>Lambda 関数のコード コード エントリ タイプは[コードをインラインで編集]のままにして以下のコードを入力します。</li></ol><div class="language-"><pre><code>import boto3\nfrom botocore.client import ClientError\nimport json\nimport urllib\n\nREGION_NAME = &#39;ap-northeast-1&#39;\nTRANSCODER_ROLE_NAME = &#39;lambda_auto_transcoder_role&#39;\nPIPELINE_NAME = &#39;wpUploadPipeline&#39;\nOUT_BUCKET_NAME = &#39;wp-bucket&#39;\nCOMPLETE_TOPIC_NAME = &#39;test-complete&#39;\n\nprint(&#39;Loading function&#39;)\n\ns3 = boto3.resource(&#39;s3&#39;)\niam = boto3.resource(&#39;iam&#39;)\nsns = boto3.resource(&#39;sns&#39;, REGION_NAME)\ntranscoder = boto3.client(&#39;elastictranscoder&#39;, REGION_NAME)\n\n\ndef lambda_handler(event, context):\n    #print(&quot;Received event: &quot; + json.dumps(event, indent=2))\n\n    # Get ARN\n    complete_topic_arn = sns.create_topic(Name=COMPLETE_TOPIC_NAME).arn\n    transcoder_role_arn = iam.Role(TRANSCODER_ROLE_NAME).arn\n\n    # Get the object from the event\n    bucket = event[&#39;Records&#39;][0][&#39;s3&#39;][&#39;bucket&#39;][&#39;name&#39;]\n    key = urllib.unquote_plus(event[&#39;Records&#39;][0][&#39;s3&#39;][&#39;object&#39;][&#39;key&#39;]).decode(&#39;utf8&#39;)\n    print(&quot;bucket={}, key={}&quot;.format(bucket, key))\n    try:\n        obj = s3.Object(bucket, key)\n    except Exception as e:\n        print(e)\n        print(&quot;Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.&quot;.format(key, bucket))\n        # Publish a message\n        sns.Topic(complete_topic_arn).publish(\n            Subject=&quot;Error!&quot;,\n            Message=&quot;Failed to get object from S3. bucket={}, key={}, {}&quot;.format(bucket, key, e),\n        )\n        raise e\n\n    # Delete inactive pipelines\n    pipeline_ids = [pipeline[&#39;Id&#39;] for pipeline in transcoder.list_pipelines()[&#39;Pipelines&#39;] if pipeline[&#39;Name&#39;] == PIPELINE_NAME]\n    for pipeline_id in pipeline_ids:\n        try:\n            response = transcoder.delete_pipeline(Id=pipeline_id)\n            print(&quot;Delete a transcoder pipeline. pipeline_id={}&quot;.format(pipeline_id))\n            print(&quot;response={}&quot;.format(response))\n        except Exception as e:\n            # Raise nothing\n            print(&quot;Failed to delete a transcoder pipeline. pipeline_id={}&quot;.format(pipeline_id))\n            print(e)\n\n    # Create a pipeline\n    try:\n        response = transcoder.create_pipeline(\n            Name=PIPELINE_NAME,\n            InputBucket=bucket,\n            OutputBucket=OUT_BUCKET_NAME,\n            Role=transcoder_role_arn,\n            Notifications={\n                &#39;Progressing&#39;: &#39;&#39;,\n                &#39;Completed&#39;: complete_topic_arn,\n                &#39;Warning&#39;: &#39;&#39;,\n                &#39;Error&#39;: &#39;&#39;\n            },\n        )\n        pipeline_id = response[&#39;Pipeline&#39;][&#39;Id&#39;]\n        print(&quot;Create a transcoder pipeline. pipeline_id={}&quot;.format(pipeline_id))\n        print(&quot;response={}&quot;.format(response))\n    except Exception as e:\n        print(&quot;Failed to create a transcoder pipeline.&quot;)\n        print(e)\n        # Publish a message\n        sns.Topic(complete_topic_arn).publish(\n            Subject=&quot;Error!&quot;,\n            Message=&quot;Failed to create a transcoder pipeline. bucket={}, key={}, {}&quot;.format(bucket, key, e),\n        )\n        raise e\n\n    # Create a job\n    try:\n        job = transcoder.create_job(\n            PipelineId=pipeline_id,\n            Input={\n                &#39;Key&#39;: key,\n                &#39;FrameRate&#39;: &#39;auto&#39;,\n                &#39;Resolution&#39;: &#39;auto&#39;,\n                &#39;AspectRatio&#39;: &#39;auto&#39;,\n                &#39;Interlaced&#39;: &#39;auto&#39;,\n                &#39;Container&#39;: &#39;auto&#39;,\n            },\n            Outputs=[\n                {\n                    &#39;Key&#39;: &#39;output/{}&#39;.format(&#39;.&#39;.join(key.split(&#39;.&#39;)[:-1])) + &#39;.mp4&#39;,\n                    &#39;PresetId&#39;: &#39;1351620000001-000061&#39;,  # System preset generic 320x240\n                },\n            ],\n        )\n        job_id = job[&#39;Job&#39;][&#39;Id&#39;]\n        print(&quot;Create a transcoder job. job_id={}&quot;.format(job_id))\n        print(&quot;job={}&quot;.format(job))\n    except Exception as e:\n        print(&quot;Failed to create a transcoder job. pipeline_id={}&quot;.format(pipeline_id))\n        print(e)\n        # Publish a message\n        sns.Topic(complete_topic_arn).publish(\n            Subject=&quot;Error!&quot;,\n            Message=&quot;Failed to create transcoder job. pipeline_id={}, {}&quot;.format(pipeline_id, e),\n        )\n        raise e\n\n    return &quot;Success&quot;\n</code></pre></div><blockquote><p>TRANSCODER_ROLE_NAME = &#39;lambda_auto_transcoder_role&#39; PIPELINE_NAME = &#39;wpUploadPipeline&#39; OUT_BUCKET_NAME = &#39;wp-bucket&#39;</p></blockquote><p>はこれまでに作ってきたものの名前に合わせてください。 elastic transcoderにあるPresetsのページにpresetの一覧があるので、そこから使いたいpresetのIDのをコピーして「PresetId」にペーストします。 今回はSystem preset generic 320x240のIDである[1351620000001-000061]を記述しました。 もしcontainerがtsの場合は</p><div class="language-"><pre><code>Outputs=[\n\t{\n\t\t&#39;Key&#39;: &#39;output/{}&#39;.format(&#39;.&#39;.join(key.split(&#39;.&#39;)[:-1])),\n\t\t&#39;PresetId&#39;: &#39;1351620000001-200030&#39;,  # System preset: HLS 1M\n\t\t&#39;SegmentDuration&#39;: &#39;10&#39;,\n\t},\n],\n</code></pre></div><p>こんな感じで「SegmentDuration」が必要っぽいです。</p><ol start="6"><li>Lambda 関数ハンドラおよびロール 先程作成したロールを選択する。</li></ol><table><thead><tr><th>項目</th><th>設定値</th></tr></thead><tbody><tr><td>ハンドラ*</td><td>lambda_function.lambda_handler</td></tr><tr><td>ロール*</td><td>既存のロールを選択</td></tr><tr><td>既存のロール*</td><td>lambda_auto_transcoder_role</td></tr></tbody></table><ol start="7"><li>詳細設定 実際の処理には 2200ms ほど必要なので、念のため、Advanced settingsで、Timeout を 3秒から 10秒に変更しておきます。</li></ol><table><thead><tr><th>項目</th><th>設定値</th></tr></thead><tbody><tr><td>メモリ (MB)*</td><td>128</td></tr><tr><td>タイムアウト*</td><td>0分10秒</td></tr></tbody></table><ol start="8"><li>後は全部デフォルとのままで「次へ」</li></ol><p>■参考サイト <a href="http://akiyoko.hatenablog.jp/entry/2015/12/03/000100" target="_blank" rel="noopener noreferrer">http://akiyoko.hatenablog.jp/entry/2015/12/03/000100</a></p><h2 id="uploadされたファイルを削除する。" tabindex="-1">uploadされたファイルを削除する。 <a class="header-anchor" href="#uploadされたファイルを削除する。" aria-hidden="true">#</a></h2><p>エンコードされたファイルが生成された後、エンコード前のファイルを削除する。 autoTranscoderにエンコード前のファイルを削除する記述をすると、エンコードされる前にエンコード前のファイルが削除されてしまうので新しく関数を作って、「エンコードされたファイルが生成されたら」というトリガーを作る。 新しく作成した関数の関数名は「deleteInputFunction」とする。 トリガータイプはS3とする。</p><table><thead><tr><th>項目</th><th>値</th></tr></thead><tbody><tr><td>バケット</td><td>wp-bucket</td></tr><tr><td>イベントタイプ</td><td>オブジェクトの作成 (すべて)</td></tr><tr><td>プレフィックス</td><td>output/</td></tr><tr><td>サフィックス</td><td>(空)</td></tr></tbody></table><div class="language-"><pre><code>from __future__ import print_function\n\nimport json\nimport urllib\nimport boto3\n\nprint(&#39;Loading function&#39;)\n\nOUT_BUCKET_NAME = &#39;wp-ana&#39;\n\ns3 = boto3.client(&#39;s3&#39;)\ns3client = boto3.client(&#39;s3&#39;)\n\n\ndef lambda_handler(event, context):\n    #print(&quot;Received event: &quot; + json.dumps(event, indent=2))\n\n    # Get the object from the event and show its content type\n    bucket = event[&#39;Records&#39;][0][&#39;s3&#39;][&#39;bucket&#39;][&#39;name&#39;]\n    key = urllib.unquote_plus(event[&#39;Records&#39;][0][&#39;s3&#39;][&#39;object&#39;][&#39;key&#39;].encode(&#39;utf8&#39;))\n\n        \n    #delete input file\n    try:\n        inputKey = key.replace(&#39;mp4&#39;, &#39;mov&#39;)\n        inputKey = inputKey.replace(&#39;output/&#39;, &#39;&#39;)\n        response = s3client.delete_object(\n            Bucket=bucket,\n            Key=inputKey\n        )\n        print(bucket)\n        print(inputKey)\n        print(&quot;is deleted&quot;)\n    except Exception as e:\n        print(bucket)\n        print(inputKey)\n        print(&quot;not deleted&quot;)\n        print(e)\n        raise e\n        \n    return &quot;Success&quot;\n</code></pre></div><p>バケットの権限に「DeleteObject」を追加する。</p><div class="language-"><pre><code>{\n    &quot;Version&quot;: &quot;2012-10-17&quot;,\n    &quot;Statement&quot;: [\n        {\n            &quot;Sid&quot;: &quot;&quot;,\n            &quot;Effect&quot;: &quot;Allow&quot;,\n            &quot;Principal&quot;: &quot;*&quot;,\n            &quot;Action&quot;: [\n                &quot;s3:GetObject&quot;,\n                &quot;s3:DeleteObject&quot;\n            ],\n            &quot;Resource&quot;: &quot;arn:aws:s3:::wp-ana/*&quot;\n        }\n    ]\n}\n</code></pre></div><p>参考サイト <a href="https://boto3.readthedocs.io/en/latest/reference/services/s3.html#S3.Client.delete_object" target="_blank" rel="noopener noreferrer">https://boto3.readthedocs.io/en/latest/reference/services/s3.html#S3.Client.delete_object</a></p><h3 id="ログの見方" tabindex="-1">ログの見方 <a class="header-anchor" href="#ログの見方" aria-hidden="true">#</a></h3><p>関数のページから「モニタリング」のタブをクリックして「CloudWatch のログを表示」をクリック するとログの一覧ページに飛ぶ。</p><hr><h2 id="offload-s3の設定" tabindex="-1">Offload S3の設定 <a class="header-anchor" href="#offload-s3の設定" aria-hidden="true">#</a></h2><p>AWSの右上にある自分のアカウントをクリックして、そこのドロップダウンからセキュリティ認証情報をクリック。 「アクセスキー（アクセスキー ID とシークレットアクセスキー）」を開いて「新しいアクセスキーの作成」をクリック。 「アクセスキーを表示」をクリックして「アクセスキー ID」と「シークレットアクセスキー」をどっかにコピーしておく。 wordpressのAWS→Accsess Keysの「Access Key ID」「Secret Access Key」に先程コピーした内容を貼り付ける。 Save Changesをクリック S3 and CloudFrontをクリックしてBUCKETを指定する。 Remove Files From ServerをオンにすることでWPの入っているサーバーにはアップロードしたファイルは保存されなくなる。</p><h3 id="wordpressからアップした動画ファイルのurlのパスを変更する方法" tabindex="-1">WordPressからアップした動画ファイルのURLのパスを変更する方法 <a class="header-anchor" href="#wordpressからアップした動画ファイルのurlのパスを変更する方法" aria-hidden="true">#</a></h3><p>Offload S3というプラグインを使って、メディアファイルをS3にアップロードするようにしています。 なので動画ファイルのURLにはS3からのフルパスが入ります。 ただmov形式の動画ファイルの場合のみAWS内でmp4形式にエンコードするので、wordpressのパスもエンコード後のパスに変更する必要があります。 ex. 変更前 <code>http://s3.amazonaws.com/baket/uploads/2017/05/15035446/movie.mov</code> 変更後 <code>http://s3.amazonaws.com/baket/output/uploads/2017/05/15035446/movie.mp4</code></p><h4 id="方法" tabindex="-1">方法 <a class="header-anchor" href="#方法" aria-hidden="true">#</a></h4><p>WordPressのDBにS3のパスが保存されるので、DBに保存される前に値を変更する。 ***_postmetaというテーブルのamazonS3_infoというカラムに情報が入っている。 ex.</p><div class="language-"><pre><code>a:3:{s:6:&quot;bucket&quot;;s:6:&quot;baket-name&quot;;s:3:&quot;key&quot;;s:46:&quot;output/uploads/2017/05/16082025/movie.mp4&quot;;s:6:&quot;region&quot;;s:9:&quot;us-east-3&quot;;}\n</code></pre></div><p>Offload S3のプラグインのソースを書き換えます。 amazon-s3-and-cloudfront-pro/classes/amazon-s3-and-cloudfront.php こちらのファイルを書き換えます。 upload_attachment_to_s3という関数の中の <code>add_post_meta( $post_id, &#39;amazonS3_info&#39;, $s3object);</code> の箇所でDB保存しているので、</p><div class="language-"><pre><code>\t//s3のエンコード後のパスに変更する為の関数\n\tprivate function s3object_output($s3object){\n\t\t$file_info = pathinfo($s3object[&#39;key&#39;]);\n\t\t$img_extension = strtolower($file_info[&#39;extension&#39;]);\n\t\tif($img_extension == &#39;mov&#39;){\n\t\t\t$s3object[&#39;key&#39;] = &#39;output/&#39; . str_replace(&quot;.mov&quot;, &quot;.mp4&quot;, $s3object[&#39;key&#39;]);\n\t\t}\n\t\treturn $s3object;\n\t}\n</code></pre></div><p>という関数を追加して、</p><div class="language-"><pre><code>add_post_meta( $post_id, &#39;amazonS3_info&#39;, $this-&gt;s3object_output($s3object));\n</code></pre></div><p>と書き換えます。 s3object_outputの関数ではもしアップロードしたファイルの拡張子がmovだった場合mp4に変更してディレクトリもoutput/を追加するようにいたしました。</p>',68)];var u=t(r,[["render",function(t,n,a,r,u,s){return o(),e("div",null,i)}]]);export{a as __pageData,u as default};
