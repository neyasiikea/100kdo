import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: '关于',
  description: '什么是 100kdo？怎么用？端口是什么？',
};

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>关于 100kdo</h1>

      <section className={styles.section}>
        <h2 className={styles.heading}>这是什么？</h2>
        <p className={styles.paragraph}>
          100kdo（十万个干什么）是一个面向普通人的 AI 领域专家知识库。
          它将专业领域的知识封装成可直接复制粘贴到 AI 对话中的「工具包」，
          让任何人都能一秒变身为育儿专家、求职顾问、法律助理或理财规划师。
        </p>
        <p className={styles.paragraph}>
          每个工具包包含三部分：
          一个精心编写的专家 Prompt（告诉 AI 它应该扮演什么角色、遵循什么规范）、
          一组权威数据端口（连接到真实的数据源或 API）、
          以及常见场景的处理流程。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>怎么用？</h2>
        <ol className={styles.orderedList}>
          <li className={styles.listItem}>
            <strong>搜索</strong> 你想解决的问题（如「孩子发烧怎么办」）
          </li>
          <li className={styles.listItem}>
            <strong>找到</strong> 对应领域的专家工具包
          </li>
          <li className={styles.listItem}>
            <strong>点击复制</strong> 按钮，获取完整的专家 Prompt + 数据端口信息
          </li>
          <li className={styles.listItem}>
            <strong>粘贴到任意 AI 对话中</strong>（ChatGPT、DeepSeek、Kimi 等均可），AI 即刻以专家视角回答你的问题
          </li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>什么是端口（Port）？</h2>
        <p className={styles.paragraph}>
          端口是连接真实世界权威数据源的桥梁。通过配置端口，AI
          不再仅依靠训练数据回答，而是实时查询临床指南、法律条文、薪酬数据库等信息源，
          从而大幅提升回答的准确性和时效性。
        </p>
        <p className={styles.paragraph}>
          端口有多种形态：REST API、MCP Server、GPTs Action、Skill 文件等。
          目前项目处于早期阶段，端口以社区贡献为主；随着生态成熟，
          将逐步接入经过验证的权威数据源。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>100kdo 不是什么</h2>
        <ul className={styles.unorderedList}>
          <li className={styles.listItem}>
            不是医疗机构，不提供医疗诊断或处方
          </li>
          <li className={styles.listItem}>
            不是法律机构，不提供正式法律意见
          </li>
          <li className={styles.listItem}>
            不是金融顾问，不构成投资建议
          </li>
          <li className={styles.listItem}>
            不是培训机构，不保证考试或求职结果
          </li>
        </ul>
        <p className={styles.paragraph}>
          所有工具包仅供信息参考和辅助决策使用。涉及健康、法律、财务等重大决策时，
          请咨询持牌专业人士。
        </p>
      </section>
    </main>
  );
}
