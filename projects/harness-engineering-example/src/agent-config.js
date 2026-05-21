/**
 * Agent 配置文件 - 驾驭工程实践
 * 
 * 支柱 2：架构约束 - 硬编码禁止
 * 支柱 3：自验证循环 - 验证规则
 */

// ============================================
// 支柱 2：工具禁令（不可协商）
// ============================================

const TOOL_BLACKLIST = {
  'repo_cat': {
    reason: '经常挂死无响应，导致整个 Agent 卡死 30s+',
    alternative: 'mtcurl REST API',
    severity: 'CRITICAL',
    example: 'mtcurl GET /api/file?path=xxx'
  },
  'parallel_download': {
    reason: 'mtcurl 挂起时整个 exec 永久卡死',
    alternative: 'serial_with_timeout_30',
    severity: 'CRITICAL',
    example: 'for file in files; do mtcurl --timeout 30 $file; done'
  },
  'ciba_auth': {
    reason: '沙箱环境不可靠，经常超时',
    alternative: 'CDP 浏览器 SSO',
    severity: 'CRITICAL'
  },
  'web_search': {
    reason: '沙箱网络不通',
    alternative: 'catclaw-search',
    severity: 'CRITICAL'
  }
};

// ============================================
// 支柱 3：自验证触发条件
// ============================================

const VERIFICATION_TRIGGERS = {
  // 结论含具体数值/金额/比例/状态码
  HAS_NUMERIC_VALUE: /\d+|金额|比例|状态码|错误码/,
  
  // 结论含字段名/表名/方法名
  HAS_IDENTIFIER: /\w+\.\w+|表名|字段|方法|函数/,
  
  // 结论含推断性词汇
  HAS_INFERENCE: /应该|推断|大概|可能|我认为|应该是|估计|猜测/,
  
  // 知识库相似度阈值
  SIMILARITY_THRESHOLD: 0.60,
  
  // 涉及写操作
  HAS_WRITE_OP: /trigger|delete|update|insert|create|modify/,
  
  // 含明确时间节点
  HAS_TIME_NODE: /今天|本周|昨天|明天|这个月|上个月/
};

// ============================================
// 支柱 3：验证规则
// ============================================

class VerificationEngine {
  /**
   * 检查是否需要验证
   */
  shouldVerify(conclusion) {
    const triggers = VERIFICATION_TRIGGERS;
    
    // 满足任一条件就需要验证
    return (
      triggers.HAS_NUMERIC_VALUE.test(conclusion) ||
      triggers.HAS_IDENTIFIER.test(conclusion) ||
      triggers.HAS_INFERENCE.test(conclusion) ||
      triggers.HAS_WRITE_OP.test(conclusion) ||
      triggers.HAS_TIME_NODE.test(conclusion)
    );
  }
  
  /**
   * 证伪优先 - 先尝试推翻结论
   */
  async verifyByFalsification(conclusion, context) {
    console.log('🔍 开始证伪验证...');
    
    // Step 1: 搜索是否存在与结论矛盾的证据
    const counterEvidence = await this.searchCounterEvidence(conclusion);
    if (counterEvidence) {
      console.log('❌ 发现反证，结论推翻');
      return {
        valid: false,
        reason: '发现矛盾证据',
        evidence: counterEvidence
      };
    }
    
    // Step 2: 找调用方代码确认实际行为
    const sourceCode = await this.readSourceCode(context.relatedFile);
    const actualBehavior = this.extractBehavior(sourceCode);
    
    // Step 3: 反例不存在 → 结论成立
    if (actualBehavior === context.expectedBehavior) {
      console.log('✅ 结论成立，可以输出');
      return {
        valid: true,
        reason: '源码验证通过',
        evidence: sourceCode
      };
    }
    
    return {
      valid: false,
      reason: '实际行为与结论不符',
      actual: actualBehavior,
      expected: context.expectedBehavior
    };
  }
  
  /**
   * 低分拒答 - 根据相似度判断
   */
  decideBySimilarity(similarity) {
    if (similarity < 0.45) {
      return {
        action: 'REJECT',
        message: '⛔ 知识库无覆盖，无法给出可靠结论'
      };
    }
    
    if (similarity >= 0.45 && similarity < 0.60) {
      return {
        action: 'SELF_HEAL',
        message: '⚠️ 相似度不足，触发自愈流程'
      };
    }
    
    return {
      action: 'ACCEPT',
      message: '✅ 相似度充分，可以回答'
    };
  }
  
  /**
   * 推断结论禁止输出
   */
  rejectInferenceConclusion(conclusion) {
    if (VERIFICATION_TRIGGERS.HAS_INFERENCE.test(conclusion)) {
      return {
        rejected: true,
        reason: '推断性结论禁止输出',
        suggestion: '需要源码验证后才能输出'
      };
    }
    return { rejected: false };
  }
  
  // 辅助方法（实际项目中需要实现）
  async searchCounterEvidence(conclusion) {
    // TODO: 实现反证搜索逻辑
    return null;
  }
  
  async readSourceCode(filePath) {
    // TODO: 实现源码读取逻辑
    return '';
  }
  
  extractBehavior(sourceCode) {
    // TODO: 实现行为提取逻辑
    return null;
  }
}

// ============================================
// 支柱 2：工具调用验证
// ============================================

class ToolValidator {
  /**
   * 验证工具调用是否被禁止
   */
  validateToolCall(toolName, args) {
    if (TOOL_BLACKLIST[toolName]) {
      const blacklist = TOOL_BLACKLIST[toolName];
      throw new Error(
        `❌ 禁止使用 ${toolName}\n` +
        `原因：${blacklist.reason}\n` +
        `替代方案：${blacklist.alternative}\n` +
        `示例：${blacklist.example || '见文档'}\n` +
        `严重级别：${blacklist.severity}`
      );
    }
    return true;
  }
  
  /**
   * 获取工具的替代方案
   */
  getAlternative(toolName) {
    if (TOOL_BLACKLIST[toolName]) {
      return TOOL_BLACKLIST[toolName].alternative;
    }
    return null;
  }
}

// ============================================
// 支柱 4：上下文隔离 - 子 Agent 分流
// ============================================

class ContextIsolation {
  /**
   * 判断是否需要 spawn 子 agent
   */
  shouldSpawnSubAgent(task) {
    const estimatedToolCalls = task.estimatedToolCalls || 0;
    const estimatedDuration = task.estimatedDuration || 0;
    const isBatchOperation = task.isBatchOperation || false;
    
    // 规则：>5 次 tool call 或 >30s 耗时 或 批量操作
    return (
      estimatedToolCalls > 5 ||
      estimatedDuration > 30000 ||
      isBatchOperation
    );
  }
  
  /**
   * 生成子 Agent 的最小注入上下文
   */
  generateMinimalContext(task, fullMemory) {
    return {
      taskDescription: task.description,
      skillPath: task.skillPath,
      keyRules: this.extractKeyRules(fullMemory),
      outputFormat: task.outputFormat,
      // 禁止注入完整的 MEMORY.md
      // ❌ memory: fullMemory
    };
  }
  
  /**
   * 从完整记忆中提取关键规则
   */
  extractKeyRules(memory) {
    // 只提取与当前任务相关的规则
    return {
      toolBlacklist: TOOL_BLACKLIST,
      verificationTriggers: VERIFICATION_TRIGGERS
    };
  }
}

// ============================================
// 支柱 5：熵治理 - 知识写入门控
// ============================================

class KnowledgeGate {
  /**
   * 判断知识是否应该写入
   */
  shouldWriteToKnowledge(knowledge) {
    const importance = knowledge.importance || 0;
    
    // 只有 importance >= 0.88 的知识才写入
    if (importance < 0.88) {
      return {
        allowed: false,
        reason: `importance 不足（${importance} < 0.88）`
      };
    }
    
    // 推断/猜测禁止写入
    if (this.isInference(knowledge.content)) {
      return {
        allowed: false,
        reason: '推断性知识禁止写入'
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * 自愈 SOP
   */
  async selfHealSOP(conclusion, context) {
    console.log('🔧 触发自愈流程...');
    
    // Step 1: 承认盲区
    console.log('📝 承认盲区："知识库未覆盖，正在查源码确认"');
    
    // Step 2: 读源码（分块 ≤200 行）
    const sourceCode = await this.readSourceCodeInChunks(context.filePath);
    
    // Step 3: 提取结论
    const extractedConclusion = this.extractConclusion(sourceCode);
    
    // Step 4: 写入知识库（importance ≥ 0.95）
    const knowledge = {
      content: extractedConclusion,
      importance: 0.95,
      source: 'self_heal',
      timestamp: new Date().toISOString()
    };
    
    const gate = this.shouldWriteToKnowledge(knowledge);
    if (gate.allowed) {
      await this.writeToKnowledge(knowledge);
      console.log('✅ 已自动存入知识库');
    }
    
    return extractedConclusion;
  }
  
  isInference(content) {
    return VERIFICATION_TRIGGERS.HAS_INFERENCE.test(content);
  }
  
  async readSourceCodeInChunks(filePath) {
    // TODO: 实现分块读取逻辑
    return '';
  }
  
  extractConclusion(sourceCode) {
    // TODO: 实现结论提取逻辑
    return '';
  }
  
  async writeToKnowledge(knowledge) {
    // TODO: 实现知识写入逻辑
    console.log('💾 写入知识库:', knowledge);
  }
}

// ============================================
// 导出
// ============================================

module.exports = {
  TOOL_BLACKLIST,
  VERIFICATION_TRIGGERS,
  VerificationEngine,
  ToolValidator,
  ContextIsolation,
  KnowledgeGate
};
