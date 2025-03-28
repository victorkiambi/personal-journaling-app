import { NextResponse } from 'next/server';

export async function GET() {
  const swaggerJson = {
    openapi: '3.0.0',
    info: {
      title: 'Shamiri Journal API',
      version: '1.0.0',
      description: 'API documentation for the Shamiri Journal application',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        TextAnalysis: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  confidence: { type: 'number' },
                  category: { type: 'string', enum: ['grammar', 'style', 'completion'] },
                  replacement: { type: 'string' },
                  explanation: { type: 'string' },
                  context: { type: 'string' }
                }
              }
            },
            autoCompletions: {
              type: 'array',
              items: { type: 'string' }
            },
            writingStyle: {
              type: 'object',
              properties: {
                readability: { type: 'number' },
                complexity: { type: 'number' },
                suggestions: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          }
        },
        AIInsight: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            entryId: { type: 'string' },
            type: { type: 'string', enum: ['theme', 'pattern', 'recommendation'] },
            content: { type: 'string' },
            confidence: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'name'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                    },
                    name: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      data: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                          },
                          email: {
                            type: 'string',
                          },
                          name: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      data: {
                        type: 'object',
                        properties: {
                          user: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'string',
                              },
                              email: {
                                type: 'string',
                              },
                              name: {
                                type: 'string',
                              },
                            },
                          },
                          token: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Get current user',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'User information retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      data: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                          },
                          email: {
                            type: 'string',
                          },
                          name: {
                            type: 'string',
                          },
                          profile: {
                            type: 'object',
                            properties: {
                              bio: {
                                type: 'string',
                              },
                              location: {
                                type: 'string',
                              },
                            },
                          },
                          settings: {
                            type: 'object',
                            properties: {
                              theme: {
                                type: 'string',
                              },
                              emailNotifications: {
                                type: 'boolean',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/entries': {
        get: {
          summary: 'Get journal entries',
          tags: ['Journal Entries'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: {
                type: 'integer',
                default: 1,
              },
            },
            {
              name: 'pageSize',
              in: 'query',
              schema: {
                type: 'integer',
                default: 10,
              },
            },
            {
              name: 'categoryId',
              in: 'query',
              schema: {
                type: 'string',
              },
            },
            {
              name: 'startDate',
              in: 'query',
              schema: {
                type: 'string',
                format: 'date',
              },
            },
            {
              name: 'endDate',
              in: 'query',
              schema: {
                type: 'string',
                format: 'date',
              },
            },
            {
              name: 'search',
              in: 'query',
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Entries retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      data: {
                        type: 'object',
                        properties: {
                          items: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: {
                                  type: 'string',
                                },
                                title: {
                                  type: 'string',
                                },
                                content: {
                                  type: 'string',
                                },
                                categories: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      id: {
                                        type: 'string',
                                      },
                                      name: {
                                        type: 'string',
                                      },
                                    },
                                  },
                                },
                                metadata: {
                                  type: 'object',
                                  properties: {
                                    wordCount: {
                                      type: 'integer',
                                    },
                                    readingTime: {
                                      type: 'integer',
                                    },
                                  },
                                },
                                createdAt: {
                                  type: 'string',
                                  format: 'date-time',
                                },
                              },
                            },
                          },
                          total: {
                            type: 'integer',
                          },
                          page: {
                            type: 'integer',
                          },
                          pageSize: {
                            type: 'integer',
                          },
                          totalPages: {
                            type: 'integer',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create journal entry',
          tags: ['Journal Entries'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'content'],
                  properties: {
                    title: {
                      type: 'string',
                    },
                    content: {
                      type: 'string',
                    },
                    categoryIds: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Entry created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      data: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                          },
                          title: {
                            type: 'string',
                          },
                          content: {
                            type: 'string',
                          },
                          categories: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: {
                                  type: 'string',
                                },
                                name: {
                                  type: 'string',
                                },
                              },
                            },
                          },
                          metadata: {
                            type: 'object',
                            properties: {
                              wordCount: {
                                type: 'integer',
                              },
                              readingTime: {
                                type: 'integer',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/entries/{id}': {
        get: {
          summary: 'Get single journal entry',
          tags: ['Journal Entries'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Entry retrieved successfully',
            },
          },
        },
        put: {
          summary: 'Update journal entry',
          tags: ['Journal Entries'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                    },
                    content: {
                      type: 'string',
                    },
                    categoryIds: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Entry updated successfully',
            },
          },
        },
        delete: {
          summary: 'Delete journal entry',
          tags: ['Journal Entries'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Entry deleted successfully',
            },
          },
        },
      },
      '/categories': {
        get: {
          summary: 'Get categories',
          tags: ['Categories'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Categories retrieved successfully',
            },
          },
        },
        post: {
          summary: 'Create category',
          tags: ['Categories'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'color'],
                  properties: {
                    name: {
                      type: 'string',
                    },
                    color: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Category created successfully',
            },
          },
        },
      },
      '/categories/{id}': {
        get: {
          summary: 'Get single category',
          tags: ['Categories'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Category retrieved successfully',
            },
          },
        },
        put: {
          summary: 'Update category',
          tags: ['Categories'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                    },
                    color: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Category updated successfully',
            },
          },
        },
        delete: {
          summary: 'Delete category',
          tags: ['Categories'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Category deleted successfully',
            },
          },
        },
      },
      '/analytics': {
        get: {
          summary: 'Get user analytics',
          tags: ['Analytics'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Analytics retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      data: {
                        type: 'object',
                        properties: {
                          totalEntries: {
                            type: 'integer',
                          },
                          totalWords: {
                            type: 'integer',
                          },
                          averageWordsPerEntry: {
                            type: 'integer',
                          },
                          entriesByCategory: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                category: {
                                  type: 'string',
                                },
                                count: {
                                  type: 'integer',
                                },
                              },
                            },
                          },
                          entriesByMonth: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                month: {
                                  type: 'string',
                                },
                                count: {
                                  type: 'integer',
                                },
                              },
                            },
                          },
                          writingStreak: {
                            type: 'object',
                            properties: {
                              currentStreak: {
                                type: 'integer',
                              },
                              longestStreak: {
                                type: 'integer',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/analyze/text': {
        post: {
          summary: 'Analyze text content for suggestions and improvements',
          tags: ['AI Features'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['content'],
                  properties: {
                    content: {
                      type: 'string',
                      description: 'Text content to analyze'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Text analysis completed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/TextAnalysis' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/entries/{entryId}/insights': {
        post: {
          summary: 'Generate AI insights for a journal entry',
          tags: ['AI Features'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'entryId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'AI insights generated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/AIInsight' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        get: {
          summary: 'Get AI insights for a journal entry',
          tags: ['AI Features'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'entryId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'AI insights retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/AIInsight' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/insights': {
        get: {
          summary: 'Get all user insights with filtering options',
          tags: ['AI Features'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'type',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['theme', 'pattern', 'recommendation']
              }
            },
            {
              name: 'timeRange',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['day', 'week', 'month', 'year']
              }
            }
          ],
          responses: {
            '200': {
              description: 'User insights retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/AIInsight' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/insights/{insightId}': {
        delete: {
          summary: 'Delete an AI insight',
          tags: ['AI Features'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'insightId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'AI insight deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
  };

  return NextResponse.json(swaggerJson);
} 